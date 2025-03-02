import {NetworkInterfaceInfo, networkInterfaces} from "os";
import {Server as HttpSecureServer} from "https";
import {Server as HttpServer} from "http";
import {isObject} from "@wkronemeijer/system";

/** Retrieve the local IP where this server is accessible. */
export function getLocalIp(
    protocol: NetworkInterfaceInfo["family"],
): string | undefined {
    const interfaces = networkInterfaces();
    
    for (var name in interfaces) {
        for (const info of interfaces[name]!) {
            if (info.family === protocol && !info.internal) {
                return info.address;
            }
        }
    }
}

/** 
 * Retrieve the port where the server is accessible.
 * Returns undefined if the server is closed or not served on a network address.
 */
export function getAddressPort(server: (
    | HttpServer 
    | HttpSecureServer
)): number | undefined {
    const address = server.address();
    switch (true) {
        case isObject(address): return address.port;
        default               : return undefined;
    }
}
