import { SetMetadata } from "@nestjs/common";
export const PermissionCodes = (...codes: string[]) => SetMetadata("permissionCodes", codes);
