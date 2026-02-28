declare module 'pdf-parse' {
  interface PdfParseResult {
    text: string
    numpages?: number
    numrender?: number
    info?: any
    metadata?: any
    version?: string
  }

  function pdfParse(
    data: Buffer | Uint8Array | ArrayBuffer,
    options?: any
  ): Promise<PdfParseResult>

  export default pdfParse
}

