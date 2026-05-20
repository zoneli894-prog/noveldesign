export const DOC_ROUTE_PATTERN = '/project/default/doc/:docId'

export function docRoute(id: string): string {
  return `/project/default/doc/${id}`
}
