//LET'S NO LONGER GET LOST IN GINORMOUS JS OBJECTS AND ARRAYS! WOOT!
//OH AND ALSO let's rest credit where it's due: this project would not have been possible without 
//EDWARD HEIATT OF THE JSUNIT PROJECT

//let's start with the globalvars used for this project

var $dlb_id_au$ = $dlb_id_au$ || {};

$dlb_id_au$.utils = {};

$dlb_id_au$.utils.gen_utils = function() {

  var module = {};

  // Make a new object whose prototype is `o`.
  //
  // Taken from Douglas Crockford:
  // http://javascript.crockford.com/prototypal.html

  module.object = function(o) {
    function F() {}
    F.prototype = o;
    return new F();
  };

  // Transform `thing` using `fn`.
  //
  // If `fn` not provided, `map` will act like
  // a shallow clone, creating a copy of the object
  // but using the same members as the original.

  module.map = function(thing,fn) {
    var m;
    if(thing.length) {
      m = [];
      module.each(thing,function(n,key){
        if(fn) {
          m.push(fn(n,key));
        } else {
          m.push(n);
        }
      });
      return m;
    }
    else if(typeof(thing)=='object') {
      m = {};
      module.each(thing,function(n,key){
        if(fn) {
          m[key] = fn(n,key);
        } else {
          m[key] = n;
        }
      });
      return m;
    }
  };

  // Iterate through array or object.

  module.each = function(thing,fn) {
    // thing.length handles 'arguments' object.
    if(thing.length) {
      for(var i=0;i<thing.length;i++) {
        fn(thing[i],i);
      }
    }
    else if(typeof(thing) == 'object') {
      for(var n in thing) {
        if(thing.hasOwnProperty(n)) {
          fn(thing[n],n);
        }
      }
    }
  };

 

  module.eachr = function(thing,index,fn,nested,p) {
    var r;
    // The outer call should not set `nested`.
    // We set it to zero.
    if(!nested) nested=0;
    if(thing instanceof Array) {
      r = fn(thing,index,true,nested,p);
      if(!r) {
        for(var i=0;i<thing.length;i++) {
          module.eachr(thing[i],i,fn,nested+1,thing);
        }
      }
      r = fn(thing,index,false,nested,p);
    }
    else if(typeof(thing) == 'object') {
      r = fn(thing,index,true,nested,p);
      if(!r) {
        for(var n in thing) {
          if(thing.hasOwnProperty(n)) {
            module.eachr(thing[n],n,fn,nested+1,thing);
          }
        }
      }
      r = fn(thing,index,false,nested,p);
    } else {
      r = fn(thing,index,true,nested,p);
    }
  };

  (function(){


    module.mapr = function(thing,index,fn,nested,p) {
      var r,o;
      if(!nested) nested=0;

      // eg {prop:null}
      if(!thing) return thing;

      // Pass `o` to `fn` but recurse on `thing`.
      // Also note that we pass `o` as `p` when
      // recursing.

      if(thing instanceof Array) {
        o = clone(thing,p,index);
        r = fn(o,index,true,nested,p);
        if(!r) {
          for(var i=0;i<thing.length;i++) {
            module.mapr(thing[i],i,fn,nested+1,o);
          }
        }
        r = fn(o,index,false,nested,p);
      }
      else if(typeof(thing) == 'object') {
        o = clone(thing,p,index);
        r = fn(o,index,true,nested,p);
        if(!r) {
          for(var n in thing) {
            if(thing.hasOwnProperty(n)) {
              module.mapr(thing[n],n,fn,nested+1,o);
            }
          }
        }
        r = fn(o,index,false,nested,p);
      }
      else {
        r = fn(thing,index,true,nested,p);
      }

      return o;
    };

    var clone = function(thing,p,pindex) {

      // Shallow clone:
      var o = module.map(thing);

      // p is the ancestor of o but it
      // was a shallow clone of `thing`, so
      // p's members are the originals.
      // So what we are doing here is replacing
      // them with o.

      if(p) {
        p[pindex] = o;
      }
      return o;
    };

  })();

  // Merge b into a.
  //
  // a,b should be objects.
  // Arrays are not handled as arrays(!).
  // Generally, a and b are probably
  // object literals that you are working
  // with.
  //
  // For convenience `a` is returned.
  // 

  module.merge = function(a,b) {
    module.each(b,function(bval,bname){
      a[bname] = bval;
    });
    return a;
  };

  // Run fn n-times; if fn returns false, then halt.

  module.dotimes = function(n,fn) {
    var result;
    for(var i=0;i<n;i++) {
      result = fn(i);
      if(result===false) return;
    }
  };

  // Join elements in arr where arr is result of
  // String.prototype.split.
  // 
  // `unsplit`: will be run on every empty gap in the array
  //            including before and after
  // `process`: is called only for non-blank gaps
  // `o`      : is an optional object you can pass in which will be
  //            passed on to `unsplit` and `process`

  module.join = function(arr,unsplit,process,o) {
    var i,l=arr.length;
    for(i=0;i<l;i++) {
      if(arr[i]!=='') process(arr[i],o);
      //process(arr[i],o);
      if(i!=l-1) unsplit(o);
    }
    return o;
  };

  return module;

}();


// Generic linked list.
//
// Supports push/pop operations.

$dlb_id_au$.utils.list2 = function(){

  var module = {};

  module.List = function() {
    this.head = null;
    this.tail = null;
    this.length = 0;
    // Place to hang functions or data associated with this list.
    this.data = {};
  };

  module.makeEntry = function() {
    return {
      next:null,
      previous:null,
      // Place to hang functions or data associated with this list
      // item.
      data:{}
    };
  };

  //------------------------------------------------------------
  // List operations:

  // Get ith element from list.

  module.List.prototype.get = function(i) {
    var n,j;
    for(j=0,n=this.head;n;n=n.next,j++) {
      if(j==i) return n;
    }
  };

  // Insert new entry at the ith position.
  //
  // If i > length, then add as the last item.
  // Use module.push to insert at last position.

  module.List.prototype.insert = function(i,entry) {
    var m,n;

    if(i>=this.length) {
      return this.push();
    }

    if(entry) {
      n = entry;
    } else {
      n = module.makeEntry();
    }
    m = module.get(i);
    if(!m) throw new Error("insert: corrupt list");
    this.root.insertBefore(m);

    // <-- [m.previous] --1-- *[n] --2-- [m] -->

    // 1
    m.previous.next = n;
    n.previous = m.previous;

    // 2
    n.next = m;
    m.previous = n;

    this.length++;
    return n;
  };

  // Append entry to end of list.

  module.List.prototype.push = function(entry) {
    var t,n;
    if(entry) {
      n = entry;
    } else {
      n = module.makeEntry();
    }
    if(this.length>0) {
      t = this.tail;
      this.tail = n;
      t.next = this.tail;
      this.tail.previous = t;
    } else {
      this.length = 0;
      this.head = this.tail = n;
    }
    this.length++;
    return n;
  };

  // Pop last element from list.

  module.List.prototype.pop = function() {
    var p;
    if(this.length>0) {
      p = this.tail.previous;
      this.length--;
      if(p) {
        this.tail = p;
      }
      else {
        this.length = 0;
        this.head = this.tail = null;
      }
      this.tail = p;
    }
  };

  // Remove ith element from list and return it.
  //
  // Return null if we can't get it.

  module.List.prototype.remove = function(i) {
    var next,previous;
    var n  = this.get(i);
    if(n) {
      previous = n.previous;
      next = n.next;
      previous.next = next;
      next.previous = previous;
      return n;
    } else {
      return null;
    }
  };

  module.List.prototype.clear = function() {
    this.length = 0;
    this.head = null;
    this.tail = null;
  };


  module.List.prototype.walk = function(fn) {
    var n,i;
    for(i=0,n=this.head;n;i++,n=n.next) {
      if(fn(n,i)) {
        break;
      }
    }
  };

  module.incr = function(curr,max) {
    curr+=1;
    return curr%=max;
  };

  module.decr = function(curr,max) {
    curr-=1;
    curr%=max;
    if(curr<0) {
      curr*=-1;
    }
    return curr;
  };

  return module;

}();

// Special function stack.
// 
// The stack is assumed to contain items of form:
//   [fn,a,b,c,...]
// and unwinding will pop the item and then call:
//   item[0](item)
//
// This is a way to undo things that were done previously without
// using closures or classes.


$dlb_id_au$.utils.stack = function(){

  var module = {};

  module.Stack = function() {
    this.stack = [];
  };

  // Unwinds a stack.
  //

  module.Stack.prototype.unwind = function() {
    if(this.stack.length>0) {
      while(this.pop()){};
    }
  };

  module.Stack.prototype.pop = function() {
    var item;
    if(this.stack.length>0) {
      item = this.stack.pop();
      item[0](item);
      return item;
    }
    return null;
  };

  module.Stack.prototype.push = function(arr) {
    if(typeof(arr[0])!='function') {
      throw new Error("focus.stack.push: bad first argument.");
    }
    this.stack.push(arr);
  };

  return module;

}();


// Pretty print module for javascript.
//
// Probably a tidier way to write module.pp
// would have been to write a generic recursive
// function that walks through arrays and objects.
// Then pass a function/closure in.

$dlb_id_au$.utils.pretty_print = function() {

  var module = {};

  // Configuration settings for 'p' (the pretty printer).
  //
  // See module.p below.

  module.CONFIG = {

    // Number of levels to recurse before stopping.

    max_levels:10,

    // If on=true, print js structures with linebreaks
    // and indentation in an agreeable way.

    extended:{
      on:false,
      // Newline to use if extended.  
      newline:'\r\n',
      // Indentation character/s to use.
      // If we nest n times, indentation will be n*indent.
      indent:'  '
    },

    // If set to integer, shorten long values.
    //
    // Set to false or null otherwise.

    length:false

  };

  // Events fired by eachr.

  module.EVENTS = {

    // Called at beginning of array.
    arrayStart:0,
    // Called at end of array.
    arrayEnd:1,

    // Called before processing each item in array.
    arrayItemStart:2,
    arrayItemStartFirst:4,
    // Called after processing each item in array.
    arrayItemEnd:3,

    // Similar to array (above).
    objectStart:10,
    objectEnd:11,
    objectItemStart:12,
    objectItemStartFirst:14,
    objectItemEnd:13,

    // Items encountered in array of js object.
    item:20,

    // Called for the first array or object item.
    firstItem:21
  };


  
  // Notes
  // This is to impose limitation on recursion otherwise
  // we could get in infinite loops involving things
  // that reference eachother.

  module.eachr = function(thing,fn,max,level) {
    if(!level) level = 0; 
    //if(!max) max = module.CONFIG.max_levels;
    if(!max) throw new Error('eachr: max nesting level must be set.');
    if(level > max) {
      return;
    }
    switch(typeof(thing)) {
    case 'object':
      if(thing instanceof Array) {
        fn(module.EVENTS.arrayStart,null,thing,level);
        for(var i=0;i<thing.length;i++) {
          if(i==0) {
            fn(module.EVENTS.arrayItemStartFirst,
               i,thing[i],level);
          }
          fn(module.EVENTS.arrayItemStart,
             i,thing[i],level);
          module.eachr(thing[i],fn,max,level+1);
          fn(module.EVENTS.arrayItemEnd,i,thing[i],level);
        }
        fn(module.EVENTS.arrayEnd,null,thing,level);
      }

      // NOTEtoSELF: perhaps better way to decide what to recurse?

      else if(thing instanceof Object && !thing.nodeType) {
        var first=true,n,empty=true;
        // Check if object is empty.
        for(n in thing) {
          if(thing.hasOwnProperty(n)) {
            empty = false;
            break;
          }
        }
        if(empty) {
          fn(module.EVENTS.objectStart,null,thing,level,{empty:true});
        } else {
          fn(module.EVENTS.objectStart,null,thing,level);
        }
        for(n in thing) {
          if(thing.hasOwnProperty(n)) {
            if(first) {
              fn(module.EVENTS.objectItemStartFirst,
                 n,thing[n],level);
              first = false;
            }
            fn(module.EVENTS.objectItemStart,
               n,thing[n],level);
            module.eachr(thing[n],fn,max,level+1);
            fn(module.EVENTS.objectItemEnd,n,thing[n],level);
          }
        }
        if(empty) {
          fn(module.EVENTS.objectEnd,null,thing,level,{empty:true});
        } else {
          fn(module.EVENTS.objectEnd,null,thing,level);
        }
      }
      else {
        // hmmmmm.... Rhino java objects might end up here?
        fn(module.EVENTS.item,null,thing,level);
      }
      break;
    default:
      fn(module.EVENTS.item,null,thing,level);
      break;
    };
  };

  (function() {

    var to_string = function(thing) {
      if(thing.toString) {
        return thing.toString();
      } else {
        return thing+'';
      }
    };

    var print_string = function(thing) {
      return '"'+thing+'"';
    };


    //
    // NOTEtoSELF: don't camelcase! toString is an inbuilt
    // method!!!

    module.to_string = function(thing) {
      var s;

      if(thing == undefined) {
        return 'undefined';
      }
      if(thing == null) {
        return 'null';
      }
      if(thing === false) {
        return 'false';
      }
      if(thing === true) {
        return 'true';
      }

      switch(typeof(thing)) {
      case 'object':
        if(thing instanceof Array) {
          return thing.toString();
        }
        else if(thing instanceof Object) {
          return thing.toString();
        }
        else if(thing instanceof String) {
          return print_string(thing);
        }
        // Rhino
        else if(java && java.lang) {
          if(thing['class']===java.lang.Class)
            return to_string(thing);
          else
            return to_string(thing['class']);
        }
        else {
          to_string(thing);
        }
        break;

      case 'xml': // E4X
        return thing.toXMLString();
        break;
      case 'function':
        return thing.toString();
        break;
      case 'string':
        return print_string(thing);
        break;
      default:
        return to_string(thing);
        break;
      };
    };


  })();

  (function(){

    // Callback for eachr.
    var handler;

    // The config used by 'p'.
    var config;

    // The result string produced by 'p'.
    var str;

    // Print a js entity.
   

    module.p = function(thing,conf) {
      if(conf) {
        config = conf;
        // If conf is missing bits, put in defaults:
        if(!config.extended)
          config.extended={on:false};
        if(!config.max_levels)
          config.max_levels = 10;
      } else {
        config = module.CONFIG;
      }
      str = ''; // Reset str.
      module.eachr(thing,handler,config.max_levels);
      return str;
    };


    (function(){

      // Flag for indicating first item in array or object.

      var firstItem = false;


      handler = function(event,index,thing,level,hint) {

        switch(event) {

          // ARRAYS:
        case module.EVENTS.arrayStart:
          if(level>=config.max_levels) {
            str+='[...';
          } else {
            str+='[';
          }
          break;
        case module.EVENTS.arrayItemStartFirst:
          firstItem = true;
          break;
        case module.EVENTS.arrayItemStart:

          // Don't print the array stuffing.
          if(level>=config.max_levels) {
            if(firstItem) firstItem = false;
          }

          else {
            if(firstItem) firstItem = false;
            
            else str+=',';
          }

          break;
        case module.EVENTS.arrayItemEnd:
          break;
        case module.EVENTS.arrayEnd:
          str+=']';
          break;

          // OBJECTS:
        case module.EVENTS.objectStart:
          if(level>config.max_levels) {
            // Nothing
          } else {
            if(hint && hint.empty) {
              str+='{';
            } else if(level==config.max_levels) {
              

              str+='{...';
            } else {
              str+='{'+linebreak()+indent(level);
            }
          }
          break;
        case module.EVENTS.objectItemStartFirst:
          firstItem = true;
          break;
        case module.EVENTS.objectItemStart:
          if(level>=config.max_levels) {
            if(firstItem) firstItem = false;
          }
          else {
            if(firstItem) {
              firstItem = false;
            } else {
              // Add comma after previous item, break
              // and indent.
              str+=','+linebreak()+indent(level);
            }
            // Now print the key (index).
            // The value will get printed on the 'item' event.
            str+=index+':';
          }

          break;
        case module.EVENTS.objectItemEnd:
          break;
        case module.EVENTS.objectEnd:
          if(level>config.max_levels) {
            // Nothing
          }
          else if(level==config.max_levels) {
            str+='}';
          }
          else {
            if(hint && hint.empty) {
              str+='}';
            } else {
              str+=linebreak()+indent(level-1)+'}';
            }
          }
          //str+='}';
          break;

          // Print the actual thing.
        case module.EVENTS.item:
          str+=filter(module.to_string(thing));
          break;

        default:
          break;
        };
      };

      // Now tidy up string

      var filter = function(str) {
        if(!config.extended.on || config.length) {
          // Remove newlines and squeeze:
          str = str.replace(/\r?\n/g,'').replace(/  */g,' ');
          // Squeeze spaces around syntactical stuff:
          str = str.replace(/(\W) /g,'$1');
          str = str.replace(/ (\W)/g,'$1');
        }
        if(config.length) {
          var limit,len,remove;
          limit = config.length;
          len = str.length;
          remove = str.length-limit;
          if(str.length>limit) {
            str =
              '|'+
              str.substring(0,len/2-remove/2)+
              '...'+
              str.substring(len/2+remove/2,len)
              +'|';
          }
        }
        return str;
      };

      var indent = function(level) {
        var indent;
        if(config.extended.on) {
          for(indent='',i=0;i<level+1;i++) {
            if(config.extended.indent) {
              indent += config.extended.indent;
            }
            else {
              indent += module.CONFIG.extended.indent;
            }
          }
          return indent;
        } else {
          return '';
        }
      };

      var linebreak = function() {
        if(config.extended.on) {
          if(config.extended.newline)
            return config.extended.newline;
          else
            return module.CONFIG.extended.newline;
        } else {
          return '';
        }
      };

    })();
    
  })();

  return module;

}();

