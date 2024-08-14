import {
  BufferAttribute,
  BufferGeometry,
  Matrix4,
  Vector3,
  Vector3Like,
} from "three";

type Point3D = [number, number, number];

export function getCentroid(vertices: Point3D[]): Point3D {
  const centroid = new Vector3(0, 0, 0);
  for (const vertex of vertices) {
    centroid.add({ x: vertex[0], y: vertex[1], z: vertex[2] });
  }
  // console.log("centroid1", centroid);
  centroid.divideScalar(vertices.length);
  return [centroid.x, centroid.y, centroid.z];
}

export function computeMatrix(
  _vertices: Point3D[],
  origin: Point3D | undefined,
) {
  const normGeom = new BufferGeometry();

  const vertices = new Float32Array(
    _vertices.map((v) => [v[0], v[1], v[2]]).flat(),
  );
  normGeom.setAttribute("position", new BufferAttribute(vertices, 3));

  normGeom.computeBoundingBox();
  const boundingBox = normGeom.boundingBox;
  // console.log("boundingBox", boundingBox);

  let center;
  if (origin) {
    center = new Vector3(...origin);
  } else {
    center = new Vector3();
    boundingBox?.getCenter(center);
  }
  // console.log("center", center);

  // NOTE: We want to set the min-height to 0
  // const minY = boundingBox?.min.y;

  const s = 1; // scale

  const matrix = new Matrix4();
  matrix.set(
    s,
    0,
    0,
    -s * center.x,
    0,
    s,
    0,
    0, // -s * minY, // -s * center.y,
    0,
    0,
    s,
    -s * center.z,
    0,
    0,
    0,
    1,
  );

  return matrix;
}

export function getNewellsNormal(
  indices: { x: number; y: number; z: number }[],
) {
  // find normal with Newell's method
  const n = [0.0, 0.0, 0.0];
  for (let i = 0; i < indices.length; i++) {
    let nex = i + 1;
    if (nex == indices.length) {
      nex = 0;
    }
    n[0] =
      n[0] + (indices[i].y - indices[nex].y) * (indices[i].z + indices[nex].z);
    n[1] =
      n[1] + (indices[i].z - indices[nex].z) * (indices[i].x + indices[nex].x);
    n[2] =
      n[2] + (indices[i].x - indices[nex].x) * (indices[i].y + indices[nex].y);
  }
  const b = new Vector3(n[0], n[1], n[2]);

  return b.normalize();
}

export function to2d(p: Vector3Like, n: Vector3) {
  const _p = new Vector3(p.x, p.y, p.z);

  const x3 = new Vector3(1.1, 1.1, 1.1);
  if (x3.distanceTo(n) < 0.01) {
    x3.add(new Vector3(1.0, 2.0, 3.0));
  }

  const tmp = x3.dot(n);
  const tmp2 = n.clone();
  tmp2.multiplyScalar(tmp);
  x3.sub(tmp2);
  x3.normalize();
  const y3 = n.clone();
  y3.cross(x3);
  const x = _p.dot(x3);
  const y = _p.dot(y3);
  const re = { x: x, y: y };

  return re;
}
