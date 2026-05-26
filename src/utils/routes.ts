export const DOC_ROUTE_PATTERN = '/project/:pid/doc/:docId'

export function docRoute(id: string, pid: string = 'default'): string {
  return `/project/${pid}/doc/${id}`
}
