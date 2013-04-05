
$dlb_id_au$.schema.sets = function() {

  var module = {};
  var gen_utils = $dlb_id_au$.utils.gen_utils;
  var pretty    = $dlb_id_au$.utils.pretty_print.p;
  var schema3   = $dlb_id_au$.schema.schema3;



  module.makeSet = function(name) {
    var set = {
      name:name,
      types:{},
      methods:{
        
        add:function(type,defn) {
          set.types[type] = {
            defn:defn,
            type:type,
            schema:schema3.gen(defn),
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

