export const csvToJSON = (csv: string, removeNewlines = false) => {
  const lines = csv.split("\n");
  if (lines[lines.length - 1] === "")
      lines.splice(lines.length - 1, 1);
  const result = [];
  let headers = lines[0].replace(/"/g, "").split(",");
  headers = headers.map((header: string) => header.trim())
  for (let i = 1; i < lines.length; i++) {
      const obj: any = {};
      const currentline = lines[i].replace(/"/g, "").split(",");
      for (let j = 0; j < headers.length; j++) {
          obj[headers[j]] = removeNewlines ? currentline[j].replace(/[\r\n]/gi, "") : currentline[j];
      }
      result.push(obj);
  }
  return result;
}

export const jsonToCSV = (json: any, delimiter=",", lineDelimiter="\r\n") => {
  const keys = json.reduce((accum: string[], row: any) => { //in case different rows have different keys
    const rowKeys = Object.keys(row);
    rowKeys.forEach(key => {
      if (! accum.includes(key)){
        accum.push(key);
      }
    })
    return accum;
  }, []);
  const firstRow = keys.join(delimiter);
  const regex = new RegExp(`[${delimiter}${lineDelimiter}#]`, "gm");
  const sanitizedJson = json.map((row: any) =>{
    for (const i in row){
      row[i] = String(row[i]).replace(regex, " ");// remove delimiter and lineDelimiter characters (and #) from json values
    }
    return row;
  });
  let output = firstRow + lineDelimiter;
  output += sanitizedJson.reduce((accum: string, row: any) => {
    let rowString = "";
    keys.forEach((key: string) => {
      rowString += row[key] + delimiter;
    })
    rowString = rowString.slice(0, rowString.length - 1); //remove final delimiter
    return accum + rowString + lineDelimiter;
  }, "");
  return output;
}
