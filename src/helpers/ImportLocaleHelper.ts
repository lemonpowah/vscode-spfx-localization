import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import Logging from "../commands/Logging";
import { LocalizedResourceValue } from "../models/Config";
import { LocaleCsvData } from "../models/LocaleCsvInfo";
import ProjectFileHelper from "./ProjectFileHelper";
import { CONFIG_KEY, CONFIG_FILE_EXTENSION } from "./ExtensionSettings";

export default class ImportLocaleHelper {

  /**
   * Create the locale files
   * 
   * @param csvData 
   * @param resx 
   */
  public static createLocaleFiles(resx: LocalizedResourceValue | undefined, localeData: LocaleCsvData | null): void {
    if (!resx || !localeData) {
      return;
    }

    let fileExtension: string | undefined = vscode.workspace.getConfiguration(CONFIG_KEY).get(CONFIG_FILE_EXTENSION);
    if (!fileExtension) {
      fileExtension = "js";
    }
  
    // Create the key in the localized resource file
    let resourcePath = ProjectFileHelper.getResourcePath(resx);

    // Start creating the files
    for (const key in localeData) {
      const localLabels = localeData[key];
      if (key && localLabels && localLabels.length > 0) {
        const resourceKeys = localeData[key].filter(l => l.resx === resx.key);
        if (resourceKeys && resourceKeys.length > 0) {
          // Create the file content
          let fileContents = fileExtension === "ts" ? `declare var define: any;
       
define([], () => {
` : `define([], function() {
`;

          fileContents += `  return {
    ${resourceKeys.map(k => `${k.key}: "${k.label}"`).join(`,\n    `)}
  };
});`;
          // Start creating the file
          const fileLocation = path.join(vscode.workspace.rootPath || __dirname, resourcePath, `${key}.${fileExtension}`);
          fs.writeFileSync(fileLocation, fileContents, { encoding: "utf8" });
          Logging.info(`Localization labels have been imported.`);
        }
      }
    }
  }
}