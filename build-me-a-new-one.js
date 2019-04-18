const https = require('https');

const fs = require('fs');

//geting project type and directory bane
var [projectType, projectName] = [process.argv[2], process.argv[3]];
//console.log(projectType, projectName);

//getting project structure
const projectStructure = (() => {
    var ps = JSON.parse(fs.readFileSync('build-me/build-me.json'));

    if (projectType == 'simple-web-project') {

        setProjectName(ps.simple_web_project);
        return ps.simple_web_project;

    } else if (projectType == 'bootstrap-web-project') {

        setProjectName(ps.bootstrap_web_project);
        return ps.bootstrap_web_project;
    }
})();
//console.log(projectStructure);
//console.log(projectName);

function setProjectName(ps) {
    if (projectName == undefined) {
        projectName = Object.keys(ps)[0];
    }
}

//getting libraries links
const libs = JSON.parse(fs.readFileSync('build-me/libraries.json'));
//console.log(libs);

//getting html templates for index.html files
const projectHtml = (() => {
    if (projectType == 'simple-web-project') {
        return fs.readFileSync('build-me/html-templates/simple-html-template.txt', 'utf8');
    } else if (projectType == 'bootstrap-web-project') {
        return fs.readFileSync('build-me/html-templates/bootstrap-html-template.txt', 'utf8');
    }
})();
//console.log(projectHtml);

const generatePrject = () => {
    if (!fs.existsSync(projectName)){
        fs.mkdirSync(projectName);
    }

    var filesArr = [];
    for (var i = 0; i < Object.keys(projectStructure).length; i++) {
        filesArr.push(projectStructure[Object.keys(projectStructure)[i]]);
    }

    for (var i = 0; i < filesArr.length; i++) {

        var files = filesArr[i];

        for (var j = 0; j < files.length; j++) {

            if (files[j].indexOf('.') > -1) {

                if (files[j].indexOf('.html') > -1) {
                    createFile(files[j], projectHtml);
                } else if (files[j].indexOf('.js') > -1) {
                    createFile(files[j]);
                } else if (files[j].indexOf('.css') > -1) {
                    createFile(files[j]);
                }

            } else if (files[j].indexOf('@') > -1) {

                var f = files[1];

                if (!fs.existsSync(`${projectName}/${files[j]}`)){
                    fs.mkdirSync(`${projectName}/${files[j]}`);
                }

                addLibraries(files[j], (data) => {
                    //console.log(typeof data);
                        //fs.pipe(`${projectName}/${files[j]}/${data[element].name}`, { recursive : true });
                        //createFile(files[j], data);
                });

            }
        }
    }
}

const addLibraries = (file, callback) => {

    for (var i = 0; i < Object.keys(libs).length; i++) {

        if ((Object.keys(libs)[i]) == file) {

            var fileNames = [];

            for(var k in libs[file]){
                fileNames.push(k);
            }
            //console.log(file);

            var fileInx = 0;
            for(var j of Object.keys(libs[file])) {

                var requestStreamCollection = [];
                var responseObject = null;

                https.get(libs[file][j], (res) => {

                    res.on('data', function(chunk) {
                        requestStreamCollection.push(chunk);
                    });

                    res.on('end', function() {
                        responseObject = requestStreamCollection.join('');
                        //console.log(responseObject);
                        //console.log(fileNames[fileInx], responseObject);
                        fs.writeFile(`${projectName}/${file}/${fileNames[fileInx]}`, responseObject, (err) => {
                            if (err) {
                                console.log(err);
                            }
                        });
                        fileInx++;
                    });
                });
            }
        }
    }
};

const createFile = (file, ph = '') => {
    fs.writeFile(projectName + '/' + file, ph, (err) => {
        if (err) {
            console.log(err);
        }
    });
};

generatePrject();
