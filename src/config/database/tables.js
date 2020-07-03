const db = require("./connect");

const QueryCreateTablePessoas = `CREATE TABLE pessoas ( 
    id SERIAL,
    points INTEGER NOT NULL,
    username character varying(255) NOT NULL,
    timeon character varying(255) NOT NULL,
    timeoff character varying(255) NOT NULL,
    CONSTRAINT pessoas_pkey PRIMARY KEY (id)
)`;

const QueryCreateTableCanais = `CREATE TABLE canais ( 
    id SERIAL,
    nome character varying(255) NOT NULL,
    CONSTRAINT canais_pkey PRIMARY KEY (id)
)`;

const QueryCreateTablePessoaCanal = `CREATE TABLE pessoa_canal ( 
    id SERIAL,
    pessoa_id INTEGER,
    canal_id INTEGER NOT NULL,
    points INTEGER NOT NULL,
    status boolean NOT NULL,
    FOREIGN KEY (pessoa_id) REFERENCES pessoas (id),
    FOREIGN KEY (canal_id) REFERENCES canais (id)
)`;


async function createTablePessoas (res){
    try {
        const res = await db.query(QueryCreateTablePessoas)
        console.log('Tabela pessoas criada com sucesso');
    } catch (error) {
        if (error.code == '42P07') {
            console.log('tabela pessoas ja criada');
        }else{
            console.log('error ao criar tabela pessoas: ',error);
            res.status(400).json({
                error:error
            })
        }
    }
}

async function createTableCanais (res){
    try {
        const res = await db.query(QueryCreateTableCanais)
        console.log('Tabela canais criada com sucesso');
    } catch (error) {
        if (error.code == '42P07') {
            console.log('tabela canais ja criada');
        }else{
            console.log('error ao criar tabela canais: ',error);
            res.status(400).json({
                error:error
            })
        }
    }
}

async function createTablePessoaCanal (res){
    try {
        const res = await db.query(QueryCreateTablePessoaCanal)
        console.log('Tabela pessoa_canal criada com sucesso');
    } catch (error) {
        if (error.code == '42P07') {
            console.log('tabela pessoa_canal ja criada');
        }else{
            console.log('error ao criar tabela pessoa_canal: ',error);
            res.status(400).json({
                error:error
            })
        }
    }
}

async function createTables (){
    try {
        await createTablePessoas();
        await createTableCanais();
        await createTablePessoaCanal();
    } catch (error) {
        console.log('erro ao criar tabelas: ',error);
    }
};

createTables();
