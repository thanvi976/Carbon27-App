/** Metro-friendly single-file build (avoids pdf-lib CJS extensionless requires). */
declare module 'pdf-lib/dist/pdf-lib.esm.min.js' {
  export * from 'pdf-lib';
}
