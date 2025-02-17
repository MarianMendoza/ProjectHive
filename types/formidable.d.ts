// types/formidable.d.ts
declare module 'formidable' {
    class IncomingForm {
      uploadDir: string;
      keepExtensions: boolean;
      parse(req: any, callback: (err: any, fields: any, files: any) => void): void;
    }
    export = formidable;
  }
  