/**
 * Created by jm96 on 14-10-17.
 */
if(!Object.extend){
    Object.extend=function(origion,target){
        for(var p in target){
            origion[p]=target[p];
        }
    }
}