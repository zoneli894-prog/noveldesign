export const DOC_ROUTE_PATTERN = '/project/:pid/doc/:docId'
export const MAP_ROUTE_PATTERN = '/project/:pid/map'

export function docRoute(id: string, pid: string = 'default'): string {
  return `/project/${pid}/doc/${id}`
}

export function mapRoute(pid: string = 'default'): string {
  return `/project/${pid}/map`
}
