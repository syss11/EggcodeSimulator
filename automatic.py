import sqlite3
import json

def dbconnect():
    conn=sqlite3.connect('egcConfig.db')
    return conn,conn.cursor()

conn,cur=dbconnect()
with open('syjson.json','r',encoding='utf-8') as syj:
    syjson=json.load(syj)
    cntt=syjson['EggCodePrefab']
for cnt in cntt:
    del cnt['id']
    cur.execute("""
        INSERT INTO egcpf (pfname,pfcontent,contributor) VALUES(?,?,?) """,(
            cnt["prefabname"],
            json.dumps(cnt,ensure_ascii=False),
            '127.0.0.1'
        ))
conn.commit()
cur.close()
conn.close()