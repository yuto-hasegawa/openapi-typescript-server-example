declare global {
  type RequestFile = Buffer | Express.Multer.File;
}

export {};
