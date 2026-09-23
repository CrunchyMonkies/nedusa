import { FetchError } from "@nedusa/js-sdk"

export const isFetchError = (error: any): error is FetchError => {
  return error instanceof FetchError
}
