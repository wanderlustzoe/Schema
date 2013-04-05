
$dlb_id_au$.schema.schema3 = function() {

  var module = {};
  var gen_utils = $dlb_id_au$.utils.gen_utils;
  var pretty    = $dlb_id_au$.utils.pretty_print.p;

  var isValue = function(thing) {
    if(!thing) return true;
    if(typeof(thing)=='object') return false;
    return true;
  }

  

  module.gen = function(defn) {
    var o = {};
    var result;
    var newResult;

    

    if(defn instanceof Array) {
      if(defn.length!=1) {
        throw new Error("Array definitions must contain one item.");
      }
      newResult = function(){return [];}

      
      if(isValue(defn[0])) {
        o.set = function(v) {
          module.typeCheck$(defn[0],v,defn);
          result.push(v);
        }
      }

      
      else {
        o.defn = defn[0];
        o.m = module.gen(o.defn);
        o.push = function(fn) {
          result.push(o.m.make(fn));
        };
        o.map = function(thing,fn){
          gen_utils.each(thing,function(v,k){
            result.push(o.m.make(function(o){fn(o,v,k);}));
          });
        };
      }
    }

    

    else if(typeof(defn)=='object' && defn && defn.hasOwnProperty('_key_')) {
      newResult = function(){return {};}

      
      if(isValue(defn['_key_'])) {
        o.case = 0;
        o.addKey = function(key,v) {
          result[key] = v;
        };
      }

      
      else {
        o.case = 1;
        o.defn = defn['_key_'];
        o.m = module.gen(o.defn);
        o.addKey = function(key,fn) {
          result[key] = o.m.make(fn,result[key]);
        };
        o.map = function(thing,fn,keyfn){
          gen_utils.each(thing,function(v,k){
            var key = keyfn?keyfn(v,k):k;
            result[key] = o.m.make(function(o){fn(o,v,k);},result[key]);
          });
        };
      }
    }

    

    else if(typeof(defn)=='object' && defn) {
      newResult = function(){return {};}
      if(!result) result = {};

      
      gen_utils.each(defn,function(v,k){
        o[k] = {
          key:k
        };

        
        if(isValue(v)) {
          o[k].set = function(v2) {
            module.typeCheck$(v,v2,defn,
                              'Specificied keys, offending key is:'+this.key);
            result[this.key] = v2;
          }
        }

        
        else {
          o[k].defn = v;
          o[k].m = module.gen(o[k].defn);
          
          o[k].add = function(fn){
            if(!result[this.key]) {
              result[this.key] = o[this.key].m.make(fn);
            }
            else {
              // merge(a,b) => "merge b into a"
              gen_utils.merge(result[this.key],
                              o[this.key].m.make(fn,result[this.key]));
            }
          };

        

          if(typeof(v)=='object' && v && v.hasOwnProperty('_key_')) {
            o[k].addKey = function(key,fn){
              o[this.key].add(function(o){
                o.addKey(key,fn);
              });
            };
            o[k].map = function(thing,fn,keyfn){
              o[this.key].add(function(o){
                o.map(thing,fn,keyfn);
              });
            };
          }


          else if(v instanceof Array) {
            o[k].push = function(fn){
              o[this.key].add(function(o){
                o.push(fn);
              });
            };
            o[k].map = function(thing,fn){
              o[this.key].add(function(o){
                o.map(thing,fn);
              });
            };
          }

        }
      });
    }

    

    else {
      newResult = function(){return null;}
      o.set = function(v) {
        module.typeCheck$(defn,v,defn);
        result = v;
      }
    }



    return {



      make:function(fn,result2) {
        if(!result2) {
          result = newResult();
        } else {
          result = result2;
        }
        fn(o);
        return result;
      },
      withInstance:function(i,fn) {
        result = i;
        fn(o);
        return result;
      }
    };

  };

 

  module.typeCheck = function(defn_value,actual_value) {
    var dtype = typeof(defn_value);
    var atype = typeof(actual_value);
    if(
        
        actual_value &&
        
        (dtype=='function') &&
        
        (dtype!=atype) )
    {
      return false;
    }
    return true;
  };

  module.typeCheck$ = function(defn_value,actual_value,defn,additional_msg) {
    var result = module.typeCheck.apply(null,arguments);
    if(!result) {
      throw new Error(
        "Typecheck: value supplied doesn't match type used in definition.  "
          +"Type should be:"+typeof(defn_value)+". "
          +"You used value:<"+actual_value+">. "
          +"In defn: "+pretty(defn)+". "
          +(additional_msg ? additional_msg : "")
      );
    }
  };



  module.makeSet = function(name) {
    var set = {
      name:name,
      types:{},
      methods:{
        .
        add:function(type,defn) {
          set.types[type] = {
            defn:defn,
            type:type,
            schema:module.gen(defn),
            make:function(fn){
              var s = this.schema.make(fn);
              s._type_ = this.type;
              s._set_ = set.name;
              return s;
            },
            withInstance:function(i,fn){
              return this.schema.withInstance(i,fn);
            }
          };
        }
      }
    };
    return set;
  };

  module.withNewSet = function(name,fn) {
    var set = module.makeSet(name);
    fn(set.methods);
    return set;
  };



  module.receiversFor = function(set,receivers,catchallfn) {
    gen_utils.each(receivers,function(v,k){
      if(!set.types[k]) {
        throw new Error("Receiver type: "+k+" is not in the specified set.");
      }
    });
    return function(o) {
      var receiver;
      if(!o._set_) {
        throw new Error("receiversFor expects data with a _set_ attribute.");
      }
      if(!o._type_) {
        throw new Error("receiversFor expects data with a _type_ attribute.");
      }
      if(set.name != o._set_) {
        throw new Error("Received set "+o._set_+" and not "+set.name+".");
      }
      if(receiver = receivers[o._type_]) {
        return receiver.call(this,o);
      }
      else {
        if(catchallfn) {
          return catchallfn(o);
        }
      }
    };
  };

  return module;

}();

