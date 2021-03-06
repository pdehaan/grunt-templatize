/*
 * grunt-templatize
 * https://github.com/tauren/grunt-templatize
 *
 * Copyright (c) 2013 Tauren Mills
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  var templatize = require('templatize');
  var path = require('path');

  // Available module formats to wrap compiled function
  // Currently supporting commonjs and AMD, default AMD  
  var formats = {
    commonjs: {
      prefix: 'module.exports={',
      suffix: '};',
      firstPrefix: '',
      eachPrefix: '',
      eachMiddle: ':',
      eachSuffix: ',',
      lastSuffix: ''
    },
    amd: {
      // Prefix at top of each output file 
      prefix: 'define({',
      // Suffix at end of each output file
      suffix: '});',
      // Prefix before first source file 
      firstPrefix: '',
      // Prefix before each source file except the first
      eachPrefix: '',
      // Output between key (source filename) and function 
      eachMiddle: ':',
      // Suffix after each source file except the last
      eachSuffix: ',',
      // Suffix after last source file
      lastSuffix: ''
    },
    namespace: {
      prefix: "!function(root){",
      suffix: "}(this);",
      firstPrefix: 'root.templatize.',
      eachPrefix: 'root.templatize.',
      eachMiddle: '=',
      eachSuffix: '',
      lastSuffix: ''
    }
  };

  grunt.registerMultiTask('templatize', 'Templatize HTML.', function() {

    // Merge task-specific and/or target-specific options 
    // with specified format defaults, defaulting to amd format.
    var options = this.options(
      formats[this.options().format || 'amd'] || formats.amd
    );
    
    // Iterate over all src-dest file pairs.
    this.files.forEach(function(f) {
      // Concat prefix + specified files + suffix.
      var src = options.prefix + f.src.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      })
      .map(function(filepath, index, fileList) {
        // Read file source.
        var src = grunt.file.read(filepath);
        // Templatize file into a function
        src = templatize(src, options.templatize);
        // Get the base name of the file to use as template name
        var name = path.basename(filepath, path.extname(filepath));
        // Output key/value pair of template name and function 
        return (index === 0 ? options.firstPrefix : options.eachPrefix) +
          name + options.eachMiddle + src + 
          (index === fileList.length-1 ? options.lastSuffix : options.eachSuffix);
      })
      .join(grunt.util.normalizelf(grunt.util.linefeed)) + options.suffix;

      // At this point, all source files have been read, templatized, and 
      // concatenated together for the specific destination file

      // Write the destination file.
      grunt.file.write(f.dest, src);

      // Print a success message.
      grunt.log.writeln('File "' + f.dest + '" created.');
    });
  });

};


