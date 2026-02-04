console.log("This is a temporary JavaScript file.");
console.log("It can be used for testing purposes.");
console.log("Feel free to modify or delete it as needed.");
console.log("End of temporary file.");
function getNode(obj, path) {
  if (path === '') return obj;
  return path
    .split('/')
    .reduce((current, key) => current?.[key], obj);
}

let obj = { a: 1, b: 2 };
obj.c = 3;
obj['d'] = {a: 4, b: 5};
obj.d.c = 6;
let path = 'd/a';
console.log(`Value at path ${path}:`, obj.d.a);
console.log('Get node at path:', getNode(obj, path));
let obj2 = {};
obj2 = getNode(obj, '');
console.log('obj2:', obj2);
console.log('Get node at path d:', getNode(obj, 'd'));  
console.log('Get node at path d/c:', getNode(obj, 'd/c'));
console.log('Get = ', obj);

