//by syss
class EggcodePrefab{//蛋码预设体
    constructor(type,catalog,prefabname,params,content,extraInfo,idd){
        this.type=type
        this.catalog=catalog
        this.prefabname=prefabname
        this.params=params
        this.content=content
        this.extraInfo=extraInfo
        this.instance=null
        this.id=idd


    }
    initializePrefab(targetV){//创造蛋码对象
        //只可以对空缺进行实例化
        let wh=targetV.awhere
        
        if(targetV.catalog!='Vacancy'){
            console.dir(targetV)
            return null
        }
        //构造蛋码
        let newEggCode=null
        if(this.extraInfo){

            if(this.extraInfo.Control){
                newEggCode=new EggcodeControl(targetV.parent,this,wh+1,this.extraInfo)
            }else{
                newEggCode=new Eggcode(targetV.parent,this,wh+1)
            }
            if(this.extraInfo.Input){
                newEggCode.inputer=this.extraInfo.Input
            }
            

        }else{
            newEggCode=new Eggcode(targetV.parent,this,wh+1)
        }  
        
        newEggCode.type=this.type
        newEggCode.catalog=this.catalog
        newEggCode.params=JSON.parse(JSON.stringify(this.params))//复制构造
        newEggCode.index=targetV.index//第几个
        newEggCode.provide=this.provide
        newEggCode.content=this.content//引用构造

        if(targetV.isAction){
            targetV.parent.codes.splice(newEggCode.awhere,0,newEggCode)
        }
        newEggCode.initInstance(targetV.pos)

        if(!targetV.eventEstablished){

            targetV.eventEstablished=true
            targetV.parent.eventcode=newEggCode
            targetV.parent.domain_pfs=this.provide
            targetV.parent.newEGCA()
        }
        //重置空缺的DOM位置
        if(targetV.isAction){
            //targetV.parent.codes.splice(newEggCode.awhere,0,newEggCode)
            targetV.awhere=targetV.parent.codes.length
            targetV.instance.remove()
            targetV.initInstance()
            let m=1
            targetV.parent.codes.forEach(where => {//刷新排列
                where.awhere=m++
                
            });
        }else{
            targetV.parent.params[targetV.index].value=newEggCode
            targetV.parent.vacs[targetV.index]=null
            targetV.instance.remove()
            targetV=null
        }
        
        return newEggCode



    }
    initEvents(){//dom挂事件响应
        if(!this.instance){
            return
        }
        //预设被点击，准备实例化蛋码对象
        this.instance.addEventListener('click',()=>{
            if(WHO==null){
                
                notice.innerText="请先选中空缺"
            }else{
                if(!this.initializePrefab(WHO)){
                    notice.innerText="蛋码不能直接替换"
                }
                
                WHO.instance.classList.remove("selected")
                WHO=null
                operatable(false)
            }
        })

    }

    setVisible(vis){//设置可见性
        
        // if(!this.instance){
        //     return
        // }
        if(vis){
            this.instance.classList.remove("nodisplay")
            this.instance.parentElement.classList.remove('nodisplay')
            this.instance.parentElement.myNavi.classList.remove('nodisplay')
            //检查积木预设符不符合
            
        }else{
            this.instance.classList.add("nodisplay")
        }
    }
    initInstance(sorts){//实例化dom
        
        let newe = document.createElement('div')
        newe.title="[id:"+this.id+"] "+catasDict[this.catalog]
        let newep = document.createElement('p')
        newep.innerText=this.prefabname
        newe.classList.add(this.catalog)//根据类型设置颜色外观
        if(this.catalog=="Value" && this.type=="Bool"){
            newe.classList.add("Bool")
        }
        if(this.catalog=="Var"){
            newe.classList.add("Var")
        }
        newep.classList.add('prefabP')
        newe.appendChild(newep)
        
        //优先级，class分类属性，type返回类型，catalog大类
        if(sorts[this.class]){
            sorts[this.class].appendChild(newe)
        }else{
        if(sorts[this.type]){
            sorts[this.type].appendChild(newe)
        }else{
            if(sorts[this.catalog]){
                sorts[this.catalog].appendChild(newe)

            }else{
                console.log(this)
            }
        }
    }
        
        
        
        this.instance=newe
            
    }

   
}
//蛋码的集合，承载一列蛋码
class EggAssembly{
    constructor(parent){//DOM元素类型，如MAIN
        AllofAssembly.push(this)
        this.parent=parent
        this.vac=null//空缺
        this.instance=document.createElement('span')
        this.domain_pfs=null
        this.not_main=this.parent instanceof EggcodeControl

        this.vac=new Vacanacy(this,true)//循环引用？
        this.vac.initInstance()

        if(this.not_main){

            this.parent.instance.appendChild(document.createElement('br'))
            this.parent.instance.appendChild(this.instance)

            this.vac.eventEstablished=true
            this.instance.classList.add("assembleC")
            if(this.parent.provide){//处理特殊积木
            if(this.parent.parent.domain_pfs){
                this.domain_pfs=[]
                this.parent.parent.domain_pfs.forEach(dmp=>{
                    this.domain_pfs.push(dmp)
                })
                this.parent.provide.forEach(pfp=>{
                    this.domain_pfs.push(pfp)
                })
            }else{
                 this.domain_pfs=this.parent.provide
            }
               
            }else{
                this.domain_pfs=this.parent.parent.domain_pfs
            }

        }else{
            this.parent.appendChild(this.instance)
            this.instance.classList.add("assemble")

            this.domain_pfs=[]
        }
        
        this.eventcode=null//对应的事件蛋码
        this.codes=[]

        
        this.instance.addEventListener("click",(e)=>{
            //e.stopPropagation()
            console.dir(this.codes)
            

        })
    }

    newEGCA(){
        if(auto){
            return
        }
        AllofEGCAs.push(new EggAssembly(main))
    }
}
//蛋码对象，程序的核心，拥有树状结构。
class Eggcode{
    constructor(parent,prefab,where){
        allEGCs.push(this)
        this.type=""//返回类型，动作为None
        this.catalog=""//类别，动作Action，取值Value
       
        this.params=[]//对象数组，对象atype：参数类型列表，对象value：其他蛋码或空缺
        this.provide=null //事件或控制提供额外蛋吗预设,[id...]

        this.content=[]//蛋码内容，与params完全符合对应
        this.instance=null//蛋码的DOM
        this.prefab=prefab//预设
        this.awhere=where//排列
        this.parent=parent//他父亲
        this.vacs=[]//vacancy取值
        this.paraDom=[]//他的参数dom位置，span标签
        this.index=0//他是他父亲的第几个儿子
        this.inputer=null//输入特殊，str
        this.textarea=null//输入

    }
    //递归函数，创建dom结构
    initInstance(where=null){//where:DOM
        let newd=document.createElement('span')
        newd.classList.add('e'+this.catalog)//css
        newd.title=this.prefab.prefabname+" => "+typesDict[this.prefab.type]
        
        if(this.inputer){
            this.textarea=createInput(this,this.inputer,newd)
        }

        if(this.catalog=="Value" && this.type=="Bool"){
            newd.classList.add("eBool")
        }
        if(this.parent.paraDom){
            this.parent.paraDom[this.index].appendChild(newd)
        }else{
            if(where){
                where.after(newd)
            }else{
                this.parent.instance.appendChild(newd)
            }
        }
        this.instance=newd


        //蛋码的被点击
        this.instance.addEventListener('click',(e)=>{
            e.stopPropagation()
            if (WHO){
                WHO.instance.classList.remove("selected")
            }
            WHO=this
            operatable(true)

            notice2.innerText="当前选中："+this.prefab.prefabname+" => "+typesDict[this.prefab.type]
        
            this.instance.classList.add("selected")
            if(this.catalog!="Action" && this.catalog!="Event"  && this.catalog!='Control'){
                return
            }
            if(this.catalog=="Control"){
                if(this.otherInfo){//紫色连积木的第一个不能点
                    if(JSON.stringify(this.otherInfo.Control)!="{}")return;
                }
            }
            let nowV=this.parent.vac
            console.dir(this)
            nowV.instance.remove()
            nowV.awhere=this.awhere-1
            
            nowV.initInstance(this.instance)
        })


        let n=0
        this.content.forEach(con => {
            if (con != '#'){
                let np= document.createElement('p')
                np.classList.add("codeP")
                np.innerText=con
                this.instance.appendChild(np)
            }else{
                let ns=document.createElement('span')
                this.paraDom.push(ns)
                this.instance.appendChild(ns)
                let paraCheck = this.params[n]//params必须和content匹配否则错误
                if(paraCheck.value==null){
                    //自动添加空缺
                    let nv= new Vacanacy(this,false)
                    nv.availType=paraCheck.atype
                    dealspec(this,nv)
                    nv.index=n
                    nv.initInstance()
                    this.vacs.push(nv)
                }else{
                    
                    paraCheck.value.initInstance()//小心无限递归

                }
                n++
            }
            
        });
        if(this.provide){
            //this.instance.classList.add(this.catalog+'withProvide')
            this.provide.forEach(dpf=>{

                let nc=document.createElement('span')
                nc.style.marginLeft='5px'
                nc.innerHTML='<p class="codeP">'+dpf.prefabname+'</p>'
                nc.classList.add('eValue')

                nc.addEventListener('click',(e)=>{
                    e.stopPropagation()
                    if(WHO){
                        if(!WHO instanceof Vacanacy){
                            return
                        }
                        if(!WHO.availType.includes(dpf.type)){
                            return
                        }
                        dpf.initializePrefab(WHO)
                        WHO.instance.classList.remove("selected")
                        WHO=null
                        operatable(false)
                        
                    }
                })

                this.instance.appendChild(nc)
            })
        }
        if(this instanceof EggcodeControl){
            this.second()
        }

    }

    // second(){
        
    // }

    clean(){//清理自己与子孙
        
        this.params.forEach(chd=>{
            if(chd.value){
                chd.value.clean()
            }
        })
        if(this instanceof EggcodeControl){
            if(this.asbl){
                this.asbl.codes.forEach(co=>{
                    co.clean()
                })
                this.asbl=null
            }
            
            
            if(this.others){
                this.others.others=null
                this.others.clean()
            }
        }
        //console.log(this.awhere)
        if(this.parent.codes){
            this.parent.codes.splice(this.awhere-1,1)
        }
        this.instance.remove()
    }

    findroot(){//寻根
        if(this.catalog!="Value" && this.catalog!="Bool"){
            return this
        }else{
            return this.parent.findroot()
        }
    }
}

class EggcodeControl extends Eggcode{//紫色的蛋码积木，特殊
    constructor(parent,prefab,where,oti){//oti是额外信息
        super(parent,prefab,where)
        this.asbl=null//assembly
        this.otherInfo=JSON.parse(JSON.stringify(oti))
        this.special=null//紫色积木的连带积木
        this.others=null//一个控制块分为多个部分，这里是并列

        

    }
    second(){//第二步初始化
        if(!this.endone){
            this.asbl=new EggAssembly(this)//蛋码集合类
        }
        
        
        if(!this.otherInfo){
            return
        }
        
        let oth=this.otherInfo.Control
        if(Object.keys(oth).length==0){
            return
        }
            let newEcC = new EggcodeControl(this.parent,this.prefab,this.awhere,null)
            this.parent.codes.splice(newEcC.awhere,0,newEcC)
            //插入位置
            //连带积木id
            newEcC.special=oth.id
            newEcC.type=this.type
            newEcC.catalog=this.catalog
            newEcC.params=JSON.parse(JSON.stringify(oth.params))//复制构造
            if(oth.end){
                newEcC.endone=true
                
            }
            newEcC.content=oth.content//引用构造
            newEcC.initInstance()
            this.others=newEcC
            newEcC.others=this//?????????
            
        
    }
}

//空缺
class Vacanacy{//表示蛋码空缺处，有两种类别
    constructor(parent,isAction){
        this.parent=parent
        this.catalog='Vacancy'
        this.isAction=isAction//bool
        this.pos=null//动作时，前置dom可以是蛋码
        this.index=-1//表示在蛋码的第几个空缺，-1为动作
        this.availType=[]//可接受参数类型，从params的键复制来
        this.instance=null
        this.eventEstablished=!isAction//作为动作时，他能不能选事件
        this.awhere=0//act,在第几个
        this.spc_rule=null//特殊的选取参数方式，函数

    
    }

    refresh(){//刷新显示
        let targetV=this
        targetV.awhere=targetV.parent.codes.length
            targetV.instance.remove()
            targetV.initInstance()
            let m=1
            targetV.parent.codes.forEach(where => {//刷新排列
                where.awhere=m++
                
            });
            //console.warn(targetV.parent.codes)
    }

    initInstance(where=null){//实例化dom
        if(this.availType.includes('Var')){
            this.spc_rule=(e)=>e.catalog=='Var'
        }
        if(this.availType.includes('List')){
            this.spc_rule=(e)=>e.catalog=='List'
        }


        let myp=document.createElement('p')
        
        let mys=document.createElement('span')
        
        mys.appendChild(myp)
        //空缺dom
        
        this.instance=mys
        if(this.isAction){
            myp.classList.add('vacancyAP')
            mys.classList.add("vacancyAS")
            myp.innerText="==+=="
            if(where){
                where.after(this.instance)
                this.pos=where
            }else{
                this.parent.instance.appendChild(this.instance)
                this.pos=null
            }
        }else{
            myp.classList.add('vacancyP')
            mys.classList.add("vacancyS")
            if(this.availType.length==1){
                myp.innerText=typesDict[this.availType[0]]//空缺的参数类型显示
            }else{
                myp.innerText=typesDict["s"]//很多就显示任意
            }

            this.parent.paraDom[this.index].appendChild(this.instance)
            //找到对应span
        }

        mys.addEventListener('click',(e)=>{
            e.stopPropagation()//事件不能冒泡
            if (WHO){
                WHO.instance.classList.remove("selected")
            }
            WHO=this
            this.instance.classList.add("selected")
            changePrefabs(this.availType,this,this.spc_rule)
        })

    }
}
let Id_to_Pf={}//id映射预设体
let allsorts={}//sortdomyuansu
let allsorts_index=[]
let types_and_pfs={}
let model=null
let auto=false
let hideslist=[]
const nodisplaytyp=["s","Var","None","List","Calculate"]
function loadprefab(){//加载文件读取预设配置
    let prefablist=[]
    
    return fetch('syjson.json')
    .then(response => {
          if (!response.ok) {
              throw new Error('?')
          }
          return response.json()
      })
    .then(data => {
          const getjson=data.EggCodePrefab
         //读取types列表
         Object.keys(data.AcceptClasses).forEach(acpcls=>{
            typesDict[acpcls]=data.AcceptClasses[acpcls].name
            types_and_pfs[acpcls]=data.AcceptClasses[acpcls]['accept-pf']
         })
         alltypes=Object.keys(typesDict)//键
        
         alltypes.forEach(typ=>{//反转字典，加载option
            namesDict[typesDict[typ]]=typ
            if(nodisplaytyp.includes(typ)){
                return
            }
            let newo=document.createElement('option')
            vtypes.appendChild(newo)
            
            newo.innerText=typesDict[typ]

        })

        stdict=data.Sort
        allsorts={}
        Object.keys(stdict).forEach(std=>{
            let newsort=document.createElement('div')
            newsort.innerText=stdict[std]
            newsort.classList.add('sort')
            selector.appendChild(newsort)
            allsorts[std]=newsort

            let navisort=document.createElement('div')
            navisort.innerText=stdict[std]
            navisort.classList.add('sortnav')
            navi.appendChild(navisort)
            newsort.myNavi=navisort

            navisort.addEventListener('click',()=>{
                newsort.scrollIntoView({
                    behavior:"smooth",
                    block:"start"
                })
            })

        })
        allsorts_index=Object.keys(allsorts)
          getjson.forEach(pf => {
            //读配置设置预设
            npf=new EggcodePrefab(pf.type,pf.catalog,pf.prefabname,pf.params,pf.content,pf.extraInfo,pf.id)
            npf.provide=pf.provide
            
            if(!pf.hide){//provide是供应蛋吗，hide是特殊蛋吗
                prefablist.push(npf)
            }else{
                hideslist.push(npf)
            }
            

            npf['class']=pf['class']
            Id_to_Pf[npf.id]=npf


          });

          model=data['EGCPrefab-spare'][0]
        Object.keys(types_and_pfs).forEach(acpts=>{
            types_and_pfs[acpts].forEach(fixed=>{
                npf=new EggcodePrefab(acpts,model.catalog,fixed.content,model.params,[fixed.content],model.extraInfo,model.id)
                npf.fixed_id=fixed.id
                prefablist.push(npf)
                npf['class']=model['class']
                Id_to_Pf[fixed.id]=npf
               
            })
        })
          
          prefablist.forEach(pf=>{
            //开始显示出预设积木
            pf.initInstance(allsorts)
          })
          hideslist.forEach(hpf=>{
            hpf.initInstance(allsorts)
          })
          return prefablist
      })
      
    .catch(error => {
          console.error('json:', error)
          notice.innerText="json配置文件加载失败"
      })
      
}

//global
let AllofAssembly=[]
let allEGCs=[]//EGC就是蛋码
let selector = document.getElementById('selector')
let main = document.getElementById('main')
let notice = document.getElementById('notice')//用户可以读到的提示
let nameinput=document.getElementById("EGCname")
let navi=document.getElementById('navi')
let notice2=document.getElementById('noticeselect')
let AllofPrefabs=[]
let AllofEGCAs=[]//全局蛋码集合，EGCA
let catasDict={
    "Event":"事件",
    "Value":"取值",
    "Action":"动作",
    "Control":"控制",
    "Var":"变量"
}
let typesDict={
}
let alltypes={}



function changePrefabs(types,vac,privilege=null){//参数为类型列表，改变显示预设
    let establishV=vac.eventEstablished
    let avy=(types.length==0)
    if(!privilege){
    let display = ""
    types.forEach(ty=>{
        display+=typesDict[ty]
        display+=","
    })
    
    if(avy){display="无"}//显示无
    notice.innerText="类型："+display
    }else{
    notice.innerText="查找成功"
    }   
    allsorts_index.forEach(sor=>{
    allsorts[sor].classList.add("nodisplay")
    allsorts[sor].myNavi.classList.add('nodisplay')
    })

    hideslist.forEach(hd=>{
        hd.setVisible(false)
    })

    AllofPrefabs.forEach(pf=>{
        if(!privilege){
        //检查积木预设符不符合
        if(avy){
            if(establishV){
                pf.setVisible(pf.catalog=="Action" || pf.catalog=="Control")
            }else{
                pf.setVisible(pf.catalog=="Event")
            }
            
        }else{
            pf.setVisible(types.includes(pf.type))
        }}
        else{
            pf.setVisible(privilege(pf))
        }
    })
    if(!vac.parent)return;

    let curr_domain=vac.parent instanceof EggAssembly? vac.parent.domain_pfs : vac.parent.findroot().parent.domain_pfs
    if(!curr_domain)return;
    curr_domain.forEach(pf=>{
        pf.setVisible(types.includes(pf.type))
    })

}


function saveJSON(data) {//保存json
    
    const jsonData = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    nam=nameinput.value
    if(nam){//看有没有项目名
        if(nam.endsWith(".json")){
            a.download=nam
        }else{
            a.download=nam+".json"
        }
        
    }else{
        a.download = 'eggcode.json'
    }
    a.click()
    URL.revokeObjectURL(url)
}
//-------------------------------------------------
//递归函数，格式化取值类蛋码嵌套
function recursionValueEGC(rootcode,operobj){//rootcode蛋码对象，oper数组
    if(!rootcode){
        return
    }
    let fcode={}
    if(rootcode.special){
        fcode={"id":rootcode.special,"args":[]}//special是紫色连带对象
    }else{
        fcode={"id":rootcode.prefab.id,"args":[]}
    }
    if(rootcode.inputer){//带有输入框的蛋码，存内容。
        fcode.input_content=rootcode.inputer
    }
    if(rootcode.prefab.id==400){//400模板预设体蛋码，存id。
        fcode.id=rootcode.prefab.fixed_id
    }
    if(rootcode.prefab.id==900){
        rollvar.push(rootcode)
        fcode.temp=900+rollvar.length
    }

    rootcode.params.forEach(para=>{
        let ncode=para.value//下一层嵌套
        recursionValueEGC(ncode,fcode.args)
    })
    operobj.push(fcode)
}
//递归函数，格式化普通蛋码，处理紫色积木逻辑
function recursionConEGC(fina,operobj){//fina数组，oper集合类对象
    operobj.codes.forEach(code=>{
        let fcode=[]
        recursionValueEGC(code,fcode)
        fina.push(fcode)

        if(code instanceof EggcodeControl){
            fcode[0]["domain"]=[]//新建domin字段
            recursionConEGC(fcode[0]["domain"],code.asbl)
            
        }
    })
}
let rollvar=null//保存时用的变量计数
function saveEGC(){//保存功能
    let final={"EggCodes":[],"Vars":[]}
    rollvar=[]
    AllofEGCAs.forEach(egca=>{
        let tempfina=[]
        recursionConEGC(tempfina,egca)
        final.EggCodes.push(tempfina)
    })
    
    rollvar.forEach((roll,i)=>{
        final.Vars.push({
            'temp':900+1+i,
            'type':roll.type,
            'name':roll.content[0]
        })
    })
    saveJSON(final)
}

function openEGC(){
    document.getElementById('fileopener').click()
}

function cleanEGC(){//清除所有蛋码
    AllofEGCAs.forEach(egca=>{
        egca.instance.remove()
    })
    AllofEGCAs=[]
    //AllofEGCAs.push(new EggAssembly(main))
    allEGCs.forEach(egc =>{
        egc.clean()
    })
    allEGCs=[]
}
//----------------------------------------------
const fileInput=document.getElementById('fileopener')
fileInput.addEventListener('change', function () {//打开蛋码文件
//按照格式构造蛋码，粘贴或文件打开操作，这个函数在下面
    const selectedFile = fileInput.files[0];
    if (selectedFile) {
        const reader = new FileReader();

        reader.onload = function (e) {
            let dataf=null
            try {
                dataf = JSON.parse(e.target.result);
                console.log(dataf)
            } catch (error) {
                notice.innerText= '!解析文件时出错:'+error
            }finally{

            
            cleanEGC()
            //ALLofegca已经清空

            let varsload=dataf['Vars']
            varsload.forEach(vsl=>{
                loadV(vsl.name,vsl.type,vsl.temp)
            })

            nameinput.value=selectedFile.name
            auto=true
            dataf.EggCodes.forEach(dataegc=>{
                let tempnewegca=new EggAssembly(main)
                console.dir(construct(tempnewegca,dataegc))
                AllofEGCAs.push(tempnewegca)
                tempnewegca.codes.forEach(co=>{
                co.parent=tempnewegca 
                })
            })
            auto=false
        }
        };

        reader.onerror = function () {
            notice.innerText="文件错误";
        };

        reader.readAsText(selectedFile);
    }
});
//最抽象的函数，按照文件格式复现蛋码
function construct(target,datae,i=0){
    let mys=[]
    datae.forEach(dat=>{
        if(dat.length==0){
            return null
        }
        
        let subdat=dat[i]
        if(subdat.id==900){//变量
            subdat.id=subdat.temp
        }
        let find_pf=Id_to_Pf[subdat.id]
        if(!find_pf){
            
            return null
        }
        let negc=find_pf.initializePrefab(//保证传vacancy
            target instanceof EggAssembly? target.vac : target  )
        
        if(subdat.input_content){
            negc.textarea.innerText=subdat.input_content
            negc.inputer=subdat.input_content
        }
        mys.push(negc)
        
        if(subdat.args.length!=0){
            for(a=0;a<subdat.args.length;a++){
                console.log(negc.vacs[a])
                negc.params[a].value=construct(negc.vacs[a],[subdat.args],a)[0];
                
            }
        }
        if(negc instanceof EggcodeControl){
            construct(negc.asbl,subdat.domain)
            //console.warn("egcc")
        }

   
    })
    return mys//数组
}

function learn(){//跳转，没做
    window.open("/learn","_blank")
}
document.addEventListener('click',function(){
    if (WHO){
        WHO.instance.classList.remove("selected")
    }
    WHO=null//点到了别的地方
    operatable(false)
})
let WHO = null//who是焦点蛋码

document.addEventListener("DOMContentLoaded",()=>{//main函数
    AllofEGCAs.push(new EggAssembly(main))
    
    
    loadprefab().then(pflist=>{//等文件读完
    //console.dir(pflist)
        AllofPrefabs=pflist
        pflist.forEach(pfl=>{

            if(pfl.provide){
                let realprovide=[]
                pfl.provide.forEach(pid=>{
                    realprovide.push(Id_to_Pf[pid])
                })
                pfl.provide=realprovide
            }

            pfl.initEvents()

        hideslist.forEach(hpf=>{
            
            hpf.initEvents()
        })
})
})


});
    

//工具们
let pasteboard={}//剪贴板
let deler=document.getElementById('deler')
let copyer=document.getElementById('copyer')
let paster=document.getElementById('paster')
let bar2=document.getElementById('operatebar2')
let canoper=false
function operatable(tf){
    canoper=tf
    if(tf){
        deler.classList.remove('disoper')
        copyer.classList.remove('disoper')
        paster.classList.remove('disoper')
        bar2.classList.add('barr')
    }else{
        deler.classList.add('disoper')
        copyer.classList.add('disoper')
        paster.classList.add('disoper')
        bar2.classList.remove('barr')
    }
}

function deleteEGC(){//删除蛋码who
    if(!WHO){
        return
    }
    if(!WHO instanceof Eggcode){
        return
    }
    let whoseparent=WHO.findroot().parent
    if(WHO.catalog=="Value" ||WHO.catalog=='Var'){
        let whereme=0
        WHO.parent.params.forEach((para,i)=>{
            if(para.value==WHO){
                whereme=i
            }
        })
        WHO.clean()
        let p=WHO.parent
        //自动添加空缺
        let nv= new Vacanacy(p,false)
        nv.availType=p.params[whereme].atype
        nv.index=whereme
        nv.initInstance()
        p.vacs.push(nv)
       
    }else{//动作类型
    for (i=0;i<AllofAssembly.length;i++){
        let k=AllofAssembly[i]
        for(j=0;j<k.codes.length;j++){
            let l=k.codes[j]
            if(l==WHO){
                
                l.clean()
                if(l.catalog=="Event"){
                    l.parent.vac.eventEstablished=false
                }
                l=null
                break
            }
        }
    }
}
WHO=null
    whoseparent.vac.refresh()
}

function copyEGC(){//复制
    if(!WHO){
        return
    }
    let final={"EggCodes":[]}
    recursionConEGC(final.EggCodes,WHO.parent)
    final["EggCodes"].splice(0,1)
    pasteboard=final
}

function pasteEGC(){//粘贴
    if(!WHO){
        return
    }
    construct(WHO,pasteboard["EggCodes"])

}

const vinput=document.getElementById("vname")
const creater=document.getElementById('creater')
const vtypes=document.getElementById('vtypes')
let varmodel=null
let namesDict={}


// document.getElementById('newV').addEventListener('click',(e)=>{
//     e.stopPropagation()
    
// })
// document.getElementById('newV2').addEventListener('click',(e)=>{
//     e.stopPropagation()
    
// })
function checkPrefab(what) {
    const tr = what.trim()
    for (let i = 0; i < AllofPrefabs.length; i++) {
        if (AllofPrefabs[i].prefabname == tr) {
            return false
        }
    }
    return true
}
    

function createV(header,isList){//创建变量
    let text=vinput.value
    let nty=vtypes.value
    if(text.trim().length==0){
        alert("名称不为空")
        return
    }
    if(!checkPrefab(header+" "+text)){
        alert('重名')
        return
    }
    if(!nty){
        alert("选类型")
        return
    }
    
    let negcp=new EggcodePrefab("",
        isList?"List":"Var",
        "",[],[""],undefined,0)

    negcp.id=900
    negcp.prefabname=header+" "+text
    negcp.content[0]=header+" "+text
    
    negcp.type=isList?namesDict[nty]+"List":namesDict[nty]
    negcp.class=namesDict[nty]
    AllofPrefabs.push(negcp)
    negcp.initInstance(allsorts)
    negcp.initEvents()
    
    vinput.value=""
}
function loadV(name1,nty,tmp){//名字类型定义变量
    let negcp=new EggcodePrefab("","Var","",[],[""],undefined,0)
    negcp.id=tmp
    negcp.prefabname=name1
    negcp.content[0]=name1
    negcp.class="Var"
    negcp.type=nty
    negcp.class=nty
    AllofPrefabs.push(negcp)
    Id_to_Pf[tmp]=negcp
    negcp.initInstance(allsorts)
    negcp.initEvents()
}

const checkinput={
    "String":(c)=>true,
    "Int":(c)=>!isNaN(Number(c)) && Number.isInteger(Number(c)),
    "Float":(c)=>!isNaN(Number(c))
    
}
function createInput(targetEGC,inputtype,egcdom){
    let inp=document.createElement("textarea")
    inp.classList.add('inputer')
    inp.maxLength=512
    inp.rows="1"
    inp.placeholder="..."
    egcdom.appendChild(inp)

    inp.addEventListener('input',()=>{
        if(!checkinput[inputtype](inp.value)){
            inp.value=""
            notice.innerText="输入内容不匹配类型"
        }else{
            targetEGC.inputer=inp.value
        }
    })

    return inp
}

let flexdir='column'
function changeflex(){
    if(flexdir=='row'){
        flexdir='column'
        
    }else{
        flexdir='row'
    }
    main.style.flexDirection=flexdir
}

function query(q){
    if(!q)return;
    results=new Set()
    AllofPrefabs.forEach(pf=>{
        if(pf.prefabname.includes(q)){
            results.add(pf)
        }else{
            pf.content.forEach(pfc=>{
                if(pfc.includes(q)){
                    results.add(pf)
                }
            })
        }
    })
    let arfm=Array.from(results)
    changePrefabs(Object.keys(typesDict),{eventEstablished:false},(e)=>arfm.includes(e))
    
}

function dealspec(egc){
    return
    if(egc.prefab.id==49){

    }
}