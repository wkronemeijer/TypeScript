import { Member } from "../../(Commons)/Member";
import { StringEnum } from "../../(Commons)/StringEnum";
import { NodeName } from "../NodeName";

const typesPrefix = "@types/";

export type  DependencyKind = Member<typeof DependencyKind>
export const DependencyKind = StringEnum([
    "dependency",
    "devDependency",
    // peer deps aren't a thing for us (so far)
]);

export interface ExternalPackage {
    readonly nodeName: NodeName;
    readonly dependencyKind: DependencyKind;
    readonly isTypes: boolean;
}

export const ExternalPackage
= class      ExternalPackageImpl 
implements   ExternalPackage {
    readonly isTypes: boolean;
    
    constructor(
        readonly nodeName: NodeName,
        readonly dependencyKind: DependencyKind,
    ) {
        this.isTypes = nodeName.startsWith(typesPrefix);
    }
}
