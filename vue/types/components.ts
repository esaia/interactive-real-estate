interface Compat {
  item: string;
  meta: string;
}

interface Sizes {
  thumbnail: Thumbnail;
  medium: Thumbnail;
  large: Thumbnail;
  full: Thumbnail;
}

interface Thumbnail {
  height: number;
  width: number;
  url: string;
  orientation: string;
}

interface Nonces {
  update: string;
  delete: string;
  edit: string;
}

export interface imageInterface {
  id: number;
  title: string;
  filename: string;
  url: string;
  link: string;
  alt: string;
  author: string;
  description: string;
  caption: string;
  name: string;
  status: string;
  uploadedTo: number;
  date: string;
  modified: string;
  menuOrder: number;
  mime: string;
  type: string;
  subtype: string;
  icon: string;
  dateFormatted: string;
  nonces: Nonces;
  editLink: string;
  meta: boolean;
  authorName: string;
  authorLink: string;
  filesizeInBytes: number;
  filesizeHumanReadable: string;
  context: string;
  originalImageURL: string;
  originalImageName: string;
  height: number;
  width: number;
  orientation: string;
  sizes: Sizes;
  compat: Compat;
}

export interface ProjectInterface {
  id: string;
  title: string;
  svg: string;
  project_image: string;
  slug: string;
  polygon_data: PolygonDataCollection[];
  created_at: string;
  updated_at: string;
}

export interface FloorInterface {
  id: string;
  title: string;
  floor_number: number;
  conf: "reserved" | "sold";
  floor_image: imageInterface;
  svg: string;
  project_id: number;
  polygon_data: PolygonDataCollection[];
  created_at: string;
  updated_at: string;
}

export interface PolygonDataCollection {
  id: string;
  key: string;
  type: string;
}

// export interface PolygonDataCollection {
//   [key: string]: PolygonData;
// }

// export interface PolygonData {
//   id: string;
//   key: string;
//   type: string;
// }
