var Runner = require ("mocha-runner");

new Runner ({
    //If the reporter is not specified "dot" is used by default
    reporter: "spec",

    //Before running the tests all the files are removed to ensure a consistent state except:
    //- Excluded files
    //- Test files
    //- node_modules directory
    //- This file (the file that uses mocha-runner to run the tests)
    //It's recommended to create a folder named `tests` and put there all the testing stuff including this file
    //exclude: ["file1", "file2"],

    //To remove some specific files
    //If this property is set, "exclude" is ignored
    //include: ["file1", "file2"],

    tests: ["test-sqlite"]
}).run (function (error){
    //It's not the Mocha stderr
    if (error) console.log (error);
});