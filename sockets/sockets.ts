import { Server, Socket } from 'socket.io';
import mariadb from 'mariadb';
import { DateTime, Interval } from 'luxon';

export const disconnect = (client: Socket) => {
    client.on('disconnect', () => {
        console.log(`Cliente Desconectado.. ${client.id}`);
        endSession(client.id);
    });
}

export const saveAction = ( client: Socket, io: Server ) => {
    client.on( 'save-action', async ( logMessage: string, callback ) => {
        console.log(logMessage);
        saveToDatabase(client.id, logMessage);
        console.log('regrese');
    });
}

async function saveToDatabase(clientId: string, message: any) {
    console.log('entre')
    const pool = mariadb.createPool ({
        host: 'localhost',
        user: 'kali',
        password: 'kali',
        database: 'logs'
    });

    let conn;
    const user = message.email;
    const time = DateTime.now().toISO();
    const date = DateTime.now().toLocaleString();

    try {
        console.log('en try');
        conn = await pool.getConnection();
        const rows = await conn.query(`SELECT * FROM userLogs WHERE user='${user}' AND date='${date}' AND initialTime='${time}'`);
        
        if(rows[0] === undefined) {
            const res = conn.query('INSERT INTO userLogs (user, date, initialTime, clientId) VALUES (?,?,?,?)', [user, date, time, clientId]);
            console.log( res );
        }
    } catch( err ) {
        console.log('en catch', err);
        throw err;
    } finally {
        console.log('en finnaly');
        if ( conn ) return conn.end()   
    }

}
async function endSession(clientId: string) {
    const pool = mariadb.createPool ({
        host: 'localhost',
        user: 'kali',
        password: 'kali',
        database: 'logs'
    });

    let conn;
    const finishTime = DateTime.now().toISO();
    
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(`SELECT * FROM userLogs WHERE clientId='${clientId}'`);
        
        if (rows[0] !== undefined) {
            const startTime = DateTime.fromISO(rows[0].initialTime);
            const i = Interval.fromDateTimes (startTime, DateTime.now());

            let elapsedTime = 0;
            let units = '';

            if(i.length('seconds') < 60 ) {
                elapsedTime = i.length('seconds');
                units = 's';
            } else if (i.length('minutes') < 60 ) {
                elapsedTime = i.length('minutes');
                units = 'm';
            } else if (i.length('hours') < 24 ) {
                elapsedTime = i.length('hours');
                units = 'h';
            }

            const res = await conn.query(`UPDATE userLogs SET userLogs.endTime='${finishTime}', userLogs.sessionTime=${elapsedTime}, userLogs.units='${units}' WHERE clientId='${clientId}'`);
            console.log(res);
        }

    } catch( err ) {
        console.log('en catch', err);
        throw err;
    } finally {
        console.log('en finnaly');
        if ( conn ) return conn.end()   
    }

}