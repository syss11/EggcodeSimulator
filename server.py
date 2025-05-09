from flask import Flask,render_template,jsonify,request
import json
import sqlite3
app=Flask(__name__)

def dbconnect():
    conn=sqlite3.connect('egcConfig.db')
    return conn,conn.cursor()

def dbinit():
    conn,cur=dbconnect()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS egcpf (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                pfname TEXT ,
                pfcontent TEXT NOT NULL,
                contributor TEXT
                )
    """)
    cur.close()
    conn.close()
    
dbinit()

@app.route('/')
def root():
    return render_template('index.html')

@app.route('/egcp')
def egcproduce():
    return render_template('egcp.html')

@app.route('/syjson.json')
def makejson():#用字符串暴力凑json格式
    conn,cur=dbconnect()
    
    allegcp=cur.execute('SELECT pfcontent FROM egcpf')
    txtall=''
    ind=0
    for egc in allegcp:
        tempe=egc[0][:-1]+',"id":'+str(ind+1)+'}'
        txtall+=tempe+','
        ind+=1

    front=open('syjsonFixed.txt','r',encoding='utf-8')
    fr=front.read()
    cur.close()
    conn.close()
    front.close()
    #print('"EggCodePrefab":['+txtall[:-1]+']')
    return fr+'"EggCodePrefab":['+txtall[:-1]+']}'

@app.route('/submit',methods=['POST'])
def dealegc():
    try:
        dat=json.loads(request.data)
        print(request.data)

        conn,cur=dbconnect()
        cur.execute("""
        INSERT INTO egcpf (pfname,pfcontent,contributor) VALUES(?,?,?) """,(
            dat["prefabname"],
            json.dumps(dat,ensure_ascii=False),
            request.remote_addr
        ))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'status':1})

    except:
        return jsonify({'status':None})














if __name__=='__main__':
    app.run(debug=True)