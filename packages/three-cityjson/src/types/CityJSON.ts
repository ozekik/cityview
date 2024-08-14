export type Point3D = [number, number, number];

export interface BaseGeometry {
  type: string;
  lod: string;
}

export interface MultiPointGeometry extends BaseGeometry {
  type: "MultiPoint";
  lod: string;
  boundaries: Point3D[];
}

export interface MultiLineStringGeometry extends BaseGeometry {
  type: "MultiLineString";
  lod: string;
  boundaries: Point3D[];
}

export interface MultiSurfaceGeometry extends BaseGeometry {
  type: "MultiSurface";
  lod: string;
  boundaries: Point3D[][];
}

export interface CompositeSurfaceGeometry extends BaseGeometry {
  type: "CompositeSurface";
  lod: string;
  boundaries: Point3D[][];
}

export interface SolidGeometry extends BaseGeometry {
  type: "Solid";
  lod: string;
  boundaries: Point3D[][][];
}

export interface MultiSolidGeometry extends BaseGeometry {
  type: "MultiSolid";
  lod: string;
  boundaries: Point3D[][][][];
}

export interface CompositeSolidGeometry extends BaseGeometry {
  type: "CompositeSolid";
  lod: string;
  boundaries: Point3D[][][][];
}

export type Geometry =
  | MultiPointGeometry
  | MultiLineStringGeometry
  | MultiSurfaceGeometry
  | CompositeSurfaceGeometry
  | SolidGeometry
  | MultiSolidGeometry
  | CompositeSolidGeometry;

export type CityObject = {
  type: string;
  attributes: Record<string, any>;
  geometry: Geometry[];
};

export type CityJSON = {
  CityObjects: Record<string, CityObject>;
  vertices: Point3D[];
};
