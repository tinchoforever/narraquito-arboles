//estas variables globales sirven para conectar con arbol-draw
var nodes, edges, familyMembers;

var loaddData = function(data){


  //creo los nodos de todos 
  familyMembers = [];
  data.map(function(f,i){

    toDataURL('perfil.c2dcec1f.png', function(dataUrl) {
         familyMembers.push({
              "mainId": f.id,  
              "type":'person',"id":'p'+i,
              "name":f.name,
              "profession": "housewife",
              "sex":'m',
              "image":dataUrl,
              "relationBase": f
            });  
        })
  });
  
  function toDataURL(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
      var reader = new FileReader();
      reader.onloadend = function() {
        callback(reader.result);
      }
      reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
  }

};

//limpia los datos y luego llama a arbol-draw
var clearUpArbol = function(data){
  

  


  var familyLink = [];

  var createFamilyForDown = function(r){
    var membersDown = [];
    var id = familyLink.length + 1;
    membersDown.push(r.relationBase.id);
    return {children:[], parent:[],"type":'family',"id":'f'+id,"name":'', "image":"","direction":'down', 
            'createdFor': r.relationBase.id, members: {down:membersDown,up:[],same:[]}};
  };

var createFamilyForSame = function(r){
    var membersUp = [];
    var id = familyLink.length + 1;
    membersUp.push(r.relationBase.id);    
    return {children:[], parent:[],"type":'family',"id":'f'+id,"name":'', "image":"","direction":'same', 
            'createdFor': r.relationBase.id, members: {down:[],up:membersUp,same:membersUp}};
  };

  var getFamilyfor = function(n,d){
    for (var i = 0; i < familyLink.length; i++) {
      var l = familyLink[i];
      var members = [];
      if (d == 'down'){
        members = l.members.down;
      }
      else if (d == 'up'){
        members = l.members.up;
      } 
      else if (d == 'same'){
        members = l.members.same; 
      }

      var family;

      //Si lo encuentro, quier decir que hay relacion.
      members.map(function(member){
        if (member == n) {
          family = l
        }
        // family = l
      });


      if (family){
        break;
      }





    }
    return family;

  }

  var getMember = function(r){
    var m;
    for (var i = 0; i < familyMembers.length; i++) {
      if (familyMembers[i].relationBase.id == r){
        m = familyMembers[i];
        if (!m.children) { m.children = [];}
        if (!m.parent) { m.parent = [];}
        break;

      }
    }
    return m ;
  }

  var getSourceAndTarget = function(r,i){

      r.children=[];
      r.parent=[];
      //Si no tiene relaciones, solo lo creo a el y a su familia
      var relation ;
      //Tiene
      if (r.relationBase.source ==''){
        var f = createFamilyForDown(r,i);
        familyMembers.push(f);
        familyLink.push(f);
        //siempre lo creo como hijo.
        relation = {id:1,source:f.id,target:r.id,type:'children'};

        f.children.push(r);
        r.parent.push(f);

      }
      else {
        //tiene relacion con una persona :-o;
        // Quien es la persona?
        var memberLinked = getMember(r.relationBase.sourceId);
        //la persona que pusimos es hijo
        if (r.relationBase.relationType =='padre'){
          //down
          //hay una relacion donde la persoan que linkeo sea hijo de ?
          var f = getFamilyfor(r.relationBase.sourceId,'down');
          var elHijo = memberLinked;
          var  elPadre=  r;
          //Si no hay la creo
          if (!f){
            //y los agrego a los dos.
            var newFamiliy = createFamilyForDown(elHijo);
            familyMembers.push(newFamiliy);
            familyLink.push(newFamiliy);
            newFamiliy.members.up.push(elPadre.relationBase.id);
            newFamiliy.members.same.push(elPadre.relationBase.id);
            

            elPadre.children.push(newFamiliy);
            newFamiliy.parent.push(elPadre);
            elHijo.parent.push(newFamiliy);
            newFamiliy.children.push(elPadre);

            var z = relations.length +1;
            
            //Ahora agrego al down, como hijo
            relationFather = {id:z,source:newFamiliy.id,target:elHijo.id,type:'children'};
            //Ahora agrego al up, como como casado
            relationSon = {id:z+1,source:newFamiliy.id,target:elPadre.id,type:'married'};
            relations.push(relationFather);
            relations.push(relationSon);

          }
          else {
            f.members.up.push(r.relationBase.id);
            f.members.same.push(r.relationBase.id);
            r.children.push(f);
            f.parent.push(r);
            var z = relations.length +1;
            relation = {id:z,source:f.id,target:r.id,type:'married'};
          }

          //agrego la relacion


        }
        else if (r.relationBase.relationType =='pareja'){
          
          //hay una relacion donde la persoan que linkeo sea hijo de ?
          var f = getFamilyfor(r.relationBase.sourceId,'same');
          var laPareja = memberLinked;
          var laEmparejada=  r;
          //Si no hay la creo
          if (!f){
            //y los agrego a los dos.
            var newFamiliy = createFamilyForSame(laEmparejada);
            familyMembers.push(newFamiliy);
            familyLink.push(newFamiliy);
            
            newFamiliy.members.up.push(laPareja.relationBase.id);
            newFamiliy.members.same.push(laPareja.relationBase.id);
            
            laPareja.children.push(newFamiliy);
            newFamiliy.parent.push(laPareja);
            laEmparejada.children.push(newFamiliy);
            newFamiliy.parent.push(laEmparejada);


            var z = relations.length +1;
            


            //Ahora agrego al down, como hijo
            relationPareja = {id:z,source:newFamiliy.id,target:laPareja.id,type:'married'};
            //Ahora agrego al up, como como casado
            relationEmparejada = {id:z+1,source:newFamiliy.id,target:laEmparejada.id,type:'married'};
            relations.push(relationPareja);
            relations.push(relationEmparejada);

          }
          else {
            
            f.members.up.push(r.relationBase.id);
            f.members.same.push(r.relationBase.id);
            r.children.push(f);
            f.parent.push(r);
            var z = relations.length +1;
            relation = {id:z,source:f.id,target:r.id,type:'married'};
          }



        }
        else if (r.relationBase.relationType =='hijo'){
          //down
          //hay una relacion donde la persoan que linkeo sea hijo de ?
          var f = getFamilyfor(r.relationBase.sourceId,'up');
          var elHijo = r;
          var  elPadre=  memberLinked;
          //Si no hay la creo
          if (!f){
            //y los agrego a los dos.
            var newFamiliy = createFamilyForDown(elHijo);
            familyMembers.push(newFamiliy);
            familyLink.push(newFamiliy);
            newFamiliy.members.down.push(elPadre.relationBase.id);
            
            var z = relations.length +1;
            
            //Ahora agrego al down, como hijo
            relationSon = {id:z,source:newFamiliy.id,target:elHijo.id,type:'children'};
            //Ahora agrego al up, como como casado
            relationFather = {id:z+1,source:newFamiliy.id,target:elPadre.id,type:'married'};
            relations.push(relationFather);
            relations.push(relationSon);

          }
          else {
            f.members.down.push(r.relationBase.id);
            r.parent.push(f);
            f.children.push(r);

            var z = relations.length +1;
            relation = {id:z,source:f.id,target:r.id,type:'child'};
          }




        }

        else if (r.relationBase.relationType =='hermano'){
          //down
          //hay una relacion donde la persoan que linkeo sea hijo de ?
          var f = getFamilyfor(r.relationBase.sourceId,'down');
          var elHijo = r;
          var  elPadre=  memberLinked;
          //Si no hay la creo
          if (!f){
            //y los agrego a los dos.
            var newFamiliy = createFamilyForDown(elHijo);
            familyMembers.push(newFamiliy);
            familyLink.push(newFamiliy);
            newFamiliy.members.down.push(elPadre.relationBase.id);
            
            var z = relations.length +1;
            
            //Ahora agrego al down, como hijo
            relationSon = {id:z,source:newFamiliy.id,target:elHijo.id,type:'children'};
            //Ahora agrego al up, como como casado
            relationFather = {id:z+1,source:newFamiliy.id,target:elPadre.id,type:'children'};
            relations.push(relationFather);
            relations.push(relationSon);

          }
          else {
            f.members.down.push(r.relationBase.id);
            r.parent.push(f);
            f.children.push(r);
            var z = relations.length +1;
            relation = {id:z,source:f.id,target:r.id,type:'child'};
          }
          



        }
        
        
      }
      return relation;
        
      
  }
  var relations =[];
  familyMembers.map(function(r,i){

      var direction =  getSourceAndTarget(r,i);
      if (direction){
        relations.push(direction);  
      }
      

  })

  nodes = familyMembers;
  edges = relations;

 
  var familyNodes = [];


  //el nivel de cada nodo es la suma  de hasta donde llegan su hijos



  var sumLevel = function(fm){

    var level =0;
    if (fm.id.indexOf('f')>-1){
      level =1;
    }

    fm.parent.map(function(p){

      level += sumLevel(p);
    });
    return level;
  }

  familyMembers.map(function(fm){
    if (fm.id.indexOf('f')>-1){
      var c = sumLevel(fm);
      fm.level = c;  
    }
    
  })


  //aca llamo a Arbol-Draw :-o
  initTree();


}


//ejemplo de input de dataset, el callback deberia ser cualquier fuente de datos
d3.csv('family.csv',loaddData);

// $http.get('/user/tree/' + id).then(function(req){
//   clearUpArbol(req.data);
// })









