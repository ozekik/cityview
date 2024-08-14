// https://stackoverflow.com/questions/29182244/convert-a-string-to-a-template-string
export function interpolate(template: string, params: any) {
  const names = Object.keys(params);
  const vals = Object.values(params);
  // console.log("names, vals", names, vals);
  const result = new Function(...names, `return \`${template}\`;`)(...vals);
  // console.log("result", result);
  return result;
}
