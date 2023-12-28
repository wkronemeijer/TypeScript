import { Directory, File } from "./Entity";
import { FileExtension } from "./Extension";

export {};


const someFile = new File("C:/TestFile.txt");

someFile.path

someFile.name
someFile.fullName
someFile.extension

someFile.parent
someFile.isRoot
Directory.cwd()


const otherFile = someFile.join("folder", "subfolder", "file.txt");

someFile.to(otherFile)

someFile.changeExtension(FileExtension(".foo"));
someFile.addSuffix(FileExtension(".private"));

someFile.getStats()?.ctime;

someFile.exists();

someFile.getKind() === "file";
someFile.isFile()
someFile.isDirectory()


if (Math.random() < 10) {
    someFile.readText()
    
    someFile.writeText("lel");
    someFile.touchFile()
    someFile.touchDirectory()
    
    Array.from(someFile.readContents());
    Array.from(someFile.recursiveGetAllFiles());
    
    
    someFile.toString();
}

someFile.hasChild(otherFile);
someFile.hasDirectChild(otherFile);
