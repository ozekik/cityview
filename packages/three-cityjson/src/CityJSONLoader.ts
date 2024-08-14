import { coordsToVector3 } from "react-three-map/maplibre";

import {
  BufferGeometry,
  FileLoader,
  Float32BufferAttribute,
  Loader,
  Vector3Like,
} from "three";
import { Earcut } from "three/src/extras/Earcut.js";

import { CityJSON, CityObject, Point3D } from "./types/CityJSON";
import { computeMatrix, getCentroid, getNewellsNormal, to2d } from "./utils";

type Result = {
  geometries: BufferGeometry[];
  vertexCount: number;
  indexCount: number;
  origin: Point3D;
};

class CityJSONLoader extends Loader {
  format: "cityjson" | "cityjsonseq" = "cityjson";

  load(
    url: string,
    onLoad: (object: Result) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (event: unknown) => void,
  ): void {
    const loader = new FileLoader(this.manager);
    loader.setPath(this.path);
    loader.setRequestHeader(this.requestHeader);
    loader.setWithCredentials(this.withCredentials);
    loader.load(
      url,
      (text) => {
        try {
          if (url.endsWith("jsonl") || url.endsWith("#format=seq")) {
            this.format = "cityjsonseq";
          }
          console.log("format", this.format);
          onLoad(this.parse(text));
        } catch (err) {
          if (onError) {
            onError(err);
          } else {
            console.error(err);
          }

          this.manager.itemError(url);
        }
      },
      onProgress,
      onError,
    );
  }

  transform(vertices: Point3D[], origin: Point3D): Point3D[] {
    const clat = origin[0];
    const clon = origin[1];
    vertices = vertices.map(
      (v) =>
        coordsToVector3(
          { longitude: v[1], latitude: v[0], altitude: v[2] },
          { latitude: clat, longitude: clon, altitude: 0 },
        ),
      // [v[1], 0, -v[0]], // JGD
      // [v[0], 0, -v[1]],
    );
    // console.log("transformed", vertices);
    return vertices;
  }

  _CityObjectsToGeometries(
    cityObjects: CityObject[],
    vertices: Point3D[],
    origin: Point3D | null = null,
  ): BufferGeometry[] {
    // TODO: Fix
    origin = origin || getCentroid(vertices);

    let projectedOrigin;
    if (this.transform) {
      vertices = this.transform(vertices, origin);
      projectedOrigin = this.transform([origin], origin)[0];
    }

    const matrix = computeMatrix(vertices, projectedOrigin);
    // console.log(vertices);
    // return;

    const geometries = [];

    // Convert CityJSON to Three.js BufferGeometry and create a mesh for each city object
    for (const cityObjectId in cityObjects) {
      const geometryVertices = [];
      const faces = [];
      // Select highest lod value of geometry
      const bestLOD = cityObjects[cityObjectId].geometry.reduce(
        (acc, geometry) => {
          const lod = parseInt(geometry.lod);
          if (lod > acc) return lod;
          return acc;
        },
        0,
      );
      // console.log(bestLOD);
      for (const geometry of cityObjects[cityObjectId].geometry) {
        if (parseInt(geometry.lod) < bestLOD) continue;

        if (geometry.type === "Solid") {
          // continue;
          for (const shell of geometry.boundaries) {
            for (const surface of shell) {
              for (const vertexKey of surface) {
                // console.log(vertexKey);
                const surfaceVertices = vertexKey.reduce((acc, key) => {
                  acc.push({
                    x: vertices[key][0],
                    y: vertices[key][1],
                    z: vertices[key][2],
                  });
                  return acc;
                }, [] as Vector3Like[]);

                const normal = getNewellsNormal(surfaceVertices);
                // console.log("normal", normal);

                const pv = [];
                for (const v of surfaceVertices) {
                  const re = to2d(v, normal);
                  pv.push(re.x);
                  pv.push(re.y);
                }

                // console.log("pv", pv);

                const triangles = Earcut.triangulate(pv, undefined, 2);

                // console.log(surfaceVertices, triangles);

                const base = geometryVertices.length / 3;
                faces.push(...triangles.map((v) => v + base));
                const flatSurfaceVertices = surfaceVertices.reduce((acc, v) => {
                  acc.push(v.x, v.y, v.z);
                  return acc;
                }, [] as number[]);
                geometryVertices.push(...flatSurfaceVertices);
                // for (let triangle of triangles) {
                //     geometryVertices.push(...vertices[vertexKey[triangle]]);
                // }
              }
            }
          }
        } else if (geometry.type === "MultiSurface") {
          for (const surface of geometry.boundaries) {
            for (const vertexKey of surface) {
              // console.log(vertexKey);
              const surfaceVertices = vertexKey.reduce((acc, key) => {
                acc.push({
                  x: vertices[key][0],
                  y: vertices[key][1],
                  z: vertices[key][2],
                });
                return acc;
              }, [] as Vector3Like[]);

              const normal = getNewellsNormal(surfaceVertices);
              // console.log("normal", normal);

              const pv = [];
              for (const v of surfaceVertices) {
                const re = to2d(v, normal);
                pv.push(re.x);
                pv.push(re.y);
              }

              // console.log("pv", pv);

              const triangles = Earcut.triangulate(pv, undefined, 2);

              // console.log(surfaceVertices, triangles);

              const base = geometryVertices.length / 3;
              faces.push(...triangles.map((v) => v + base));
              const flatSurfaceVertices = surfaceVertices.reduce((acc, v) => {
                acc.push(v.x, v.y, v.z);
                return acc;
              }, [] as number[]);
              geometryVertices.push(...flatSurfaceVertices);
              // for (let triangle of triangles) {
              //     geometryVertices.push(...vertices[vertexKey[triangle]]);
              // }
            }
          }
        }
      }

      if (geometryVertices.length === 0) continue;

      const geometry = new BufferGeometry();
      // console.log(geometryVertices);
      // console.log(faces);
      geometry.setAttribute(
        "position",
        new Float32BufferAttribute(geometryVertices, 3),
      );
      // geometry.setFromPoints(geometryVertices);
      geometry.setIndex(faces);
      geometry.applyMatrix4(matrix);
      geometry.computeVertexNormals();

      // Compute UV
      const uv = [];
      for (let i = 0; i < geometryVertices.length; i += 3) {
        uv.push(geometryVertices[i]);
        uv.push(geometryVertices[i + 1]);
      }
      geometry.setAttribute("uv", new Float32BufferAttribute(uv, 2));

      geometry.userData = {
        // lod: cityObjects[cityObjectId].geometry[0].lod,
        id: cityObjectId,
        type: cityObjects[cityObjectId].type,
        attributes: cityObjects[cityObjectId].attributes,
      };
      geometries.push(geometry);
    }

    return geometries;
  }

  _parse_seq(text: string): {
    geometries: BufferGeometry[];
    vertexCount: number;
    indexCount: number;
    origin: Point3D;
  } {
    function readlines(
      text: string,
      skip = 0,
      cb: (line: string) => void,
    ): void {
      const delim = "\n";
      let i, j;
      i = j = 0;
      let count = 0;
      while ((j = text.indexOf(delim, i)) !== -1) {
        // console.log(text.substring(i, j));
        if (skip <= count) {
          cb(text.substring(i, j));
        }
        count++;
        i = j + 1;
      }
    }

    // Compute origin
    const origins: Point3D[] = [];
    readlines(text, 1, (line) => {
      const cityjson = JSON.parse(line);
      const vertices = cityjson.vertices;
      const _origin = getCentroid(vertices);
      origins.push(_origin);
    });
    const origin = getCentroid(origins);

    let geometries: BufferGeometry[] = [];
    readlines(text, 1, (line) => {
      const cityjson = JSON.parse(line);
      const cityObjects = cityjson.CityObjects;
      const vertices = cityjson.vertices;
      const g = this._CityObjectsToGeometries(cityObjects, vertices, origin);
      geometries = geometries.concat(g);
    });

    const vertexCount = geometries.reduce((acc, geometry) => {
      return acc + geometry.attributes.position.count;
    }, 0);
    const indexCount = geometries.reduce((acc, geometry) => {
      return acc + (geometry.index?.count || 0);
    }, 0);

    return { geometries, vertexCount, indexCount, origin } as Result;

    // const lines = text.split("\n");
    // const vertices = [];
    // const colors = [];
    // const color = new Color();
    // for (let line of lines) {
    //   line = line.trim();
    //   if (line.charAt(0) === "#") continue; // skip comments
    //   const lineValues = line.split(/\s+/);
    //   if (lineValues.length === 3) {
    //     // XYZ
    //     vertices.push(parseFloat(lineValues[0]));
    //     vertices.push(parseFloat(lineValues[1]));
    //     vertices.push(parseFloat(lineValues[2]));
    //   }
    //   if (lineValues.length === 6) {
    //     // XYZRGB
    //     vertices.push(parseFloat(lineValues[0]));
    //     vertices.push(parseFloat(lineValues[1]));
    //     vertices.push(parseFloat(lineValues[2]));
    //     const r = parseFloat(lineValues[3]) / 255;
    //     const g = parseFloat(lineValues[4]) / 255;
    //     const b = parseFloat(lineValues[5]) / 255;
    //     color.set(r, g, b).convertSRGBToLinear();
    //     colors.push(color.r, color.g, color.b);
    //   }
    // }
    // const geometry = new BufferGeometry();
    // geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
    // if (colors.length > 0) {
    //   geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
    // }
    // return geometry;
  }

  _parse(text: string): {
    geometries: BufferGeometry[];
    vertexCount: number;
    indexCount: number;
    origin: Point3D;
  } {
    const cityjson: CityJSON = JSON.parse(text);

    const cityObjects = cityjson.CityObjects;

    // Get CityJSON vertices
    let vertices = cityjson.vertices;

    // TODO: Fix
    const origin = getCentroid(vertices);

    let projectedOrigin;
    if (this.transform) {
      vertices = this.transform(vertices, origin);
      projectedOrigin = this.transform([origin], origin)[0];
    }

    const matrix = computeMatrix(vertices, projectedOrigin);
    // console.log(vertices);
    // return;

    const geometries = [];

    // Convert CityJSON to Three.js BufferGeometry and create a mesh for each city object
    for (const cityObjectId in cityObjects) {
      const geometryVertices = [];
      const faces = [];
      // Select highest lod value of geometry
      const bestLOD = cityObjects[cityObjectId].geometry.reduce(
        (acc, geometry) => {
          const lod = parseInt(geometry.lod);
          if (lod > acc) return lod;
          return acc;
        },
        0,
      );
      // console.log(bestLOD);
      for (const geometry of cityObjects[cityObjectId].geometry) {
        if (parseInt(geometry.lod) < bestLOD) continue;

        if (geometry.type === "Solid") {
          // continue;
          for (const shell of geometry.boundaries) {
            for (const surface of shell) {
              for (const vertexKey of surface) {
                // console.log(vertexKey);
                const surfaceVertices = vertexKey.reduce((acc, key) => {
                  acc.push({
                    x: vertices[key][0],
                    y: vertices[key][1],
                    z: vertices[key][2],
                  });
                  return acc;
                }, [] as Vector3Like[]);

                const normal = getNewellsNormal(surfaceVertices);
                // console.log("normal", normal);

                const pv = [];
                for (const v of surfaceVertices) {
                  const re = to2d(v, normal);
                  pv.push(re.x);
                  pv.push(re.y);
                }

                // console.log("pv", pv);

                const triangles = Earcut.triangulate(pv, undefined, 2);

                // console.log(surfaceVertices, triangles);

                const base = geometryVertices.length / 3;
                faces.push(...triangles.map((v) => v + base));
                const flatSurfaceVertices = surfaceVertices.reduce((acc, v) => {
                  acc.push(v.x, v.y, v.z);
                  return acc;
                }, [] as number[]);
                geometryVertices.push(...flatSurfaceVertices);
                // for (let triangle of triangles) {
                //     geometryVertices.push(...vertices[vertexKey[triangle]]);
                // }
              }
            }
          }
        } else if (geometry.type === "MultiSurface") {
          for (const surface of geometry.boundaries) {
            for (const vertexKey of surface) {
              // console.log(vertexKey);
              const surfaceVertices = vertexKey.reduce((acc, key) => {
                acc.push({
                  x: vertices[key][0],
                  y: vertices[key][1],
                  z: vertices[key][2],
                });
                return acc;
              }, [] as Vector3Like[]);

              const normal = getNewellsNormal(surfaceVertices);
              // console.log("normal", normal);

              const pv = [];
              for (const v of surfaceVertices) {
                const re = to2d(v, normal);
                pv.push(re.x);
                pv.push(re.y);
              }

              // console.log("pv", pv);

              const triangles = Earcut.triangulate(pv, undefined, 2);

              // console.log(surfaceVertices, triangles);

              const base = geometryVertices.length / 3;
              faces.push(...triangles.map((v) => v + base));
              const flatSurfaceVertices = surfaceVertices.reduce((acc, v) => {
                acc.push(v.x, v.y, v.z);
                return acc;
              }, [] as number[]);
              geometryVertices.push(...flatSurfaceVertices);
              // for (let triangle of triangles) {
              //     geometryVertices.push(...vertices[vertexKey[triangle]]);
              // }
            }
          }
        }
      }

      if (geometryVertices.length === 0) continue;

      const geometry = new BufferGeometry();
      // console.log(geometryVertices);
      // console.log(faces);
      geometry.setAttribute(
        "position",
        new Float32BufferAttribute(geometryVertices, 3),
      );
      // geometry.setFromPoints(geometryVertices);
      geometry.setIndex(faces);
      geometry.applyMatrix4(matrix);
      geometry.computeVertexNormals();

      // Compute UV
      const uv = [];
      for (let i = 0; i < geometryVertices.length; i += 3) {
        uv.push(geometryVertices[i]);
        uv.push(geometryVertices[i + 1]);
      }
      geometry.setAttribute("uv", new Float32BufferAttribute(uv, 2));

      geometry.userData = {
        // lod: cityObjects[cityObjectId].geometry[0].lod,
        id: cityObjectId,
        type: cityObjects[cityObjectId].type,
        attributes: cityObjects[cityObjectId].attributes,
      };
      geometries.push(geometry);
    }

    const vertexCount = geometries.reduce((acc, geometry) => {
      return acc + geometry.attributes.position.count;
    }, 0);
    const indexCount = geometries.reduce((acc, geometry) => {
      return acc + (geometry.index?.count || 0);
    }, 0);

    return { geometries, vertexCount, indexCount, origin } as Result;
  }

  parse(text: string): {
    geometries: BufferGeometry[];
    vertexCount: number;
    indexCount: number;
    origin: Point3D;
  } {
    if (this.format === "cityjsonseq") {
      return this._parse_seq(text);
    } else {
      return this._parse(text);
    }
  }
}

export { CityJSONLoader };
