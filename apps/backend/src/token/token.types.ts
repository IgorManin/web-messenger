export type JwtPayload = {
  sub: string
  login?: string
  iat?: number
  exp?: number
}
