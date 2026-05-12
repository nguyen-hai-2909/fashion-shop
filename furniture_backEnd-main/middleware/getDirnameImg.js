const getDirnameImg = () => {
    const dirName = __dirname.split("/");
    dirName.pop();
    const pathNameImgs = dirName.join("/");
    return `${pathNameImgs}/public/photos/`
}

module.exports = getDirnameImg;