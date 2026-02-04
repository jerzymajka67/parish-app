function transformDirList(items) {

  const result = {};

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    if (item.type === 'dir') {
      result[item.name] = {};
    }

    if (item.type === 'file') {
      if (!result.files) {
        result.files = [];
      }
      result.files.push(item.name);
    }
  }

  return result;
}

module.exports = transformDirList;
