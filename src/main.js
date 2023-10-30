import { nowInSec, SkyWayAuthToken, SkyWayContext, SkyWayRoom, SkyWayStreamFactory, uuidV4 } from '@skyway-sdk/room';

const token = new SkyWayAuthToken({
    jti: uuidV4(),
    iat: nowInSec(),
    exp: nowInSec() + 60 * 60 * 24,
    scope: {
        app: {
            id: '7ab8b490-382b-492e-bb0a-9324c3f9f86a',
            turn: true,
            actions: ['read'],
            channels: [
            {
                id: '*',
                name: '*',
                actions: ['write'],
                members: [
                    {
                        id: '*',
                        name: '*',
                        actions: ['write'],
                        publication: {
                            actions: ['write'],
                        },
                        subscription: {
                            actions: ['write'],
                        },
                    },
                ],
                sfuBots: [
                    {
                        actions: ['write'],
                        forwardings: [
                            {
                                actions: ['write'],
                            },
                        ],
                    },
                ],
            },
            ],
        },
    },
  
}).encode('S6MaSxEOJoQlM9JnfgowvhVbdsWIV9bz4WKW7fsftzc=');

(async () => {
    // 1
    const localVideo = document.getElementById('local-video');
    const buttonArea = document.getElementById('button-area');
    const remoteMediaArea = document.getElementById('remote-media-area');
    const roomNameInput = document.getElementById('room-name');

    const myId = document.getElementById('my-id');
    const joinButton = document.getElementById('join');

    const { audio, video } = await SkyWayStreamFactory.createMicrophoneAudioAndCameraStream(); // 2
  
    video.attach(localVideo); // 3
    await localVideo.play(); // 4

    // トークンからコンテクストを作成する。
    // コンテクストには認証や認可ログの設定などの情報が格納されている。
    // また、roomnameが入力されていない場合は先に進めないので処理を組み込む
    joinButton.onclick = async () => {
        console.log("joinボタンが押されました。")
        if (roomNameInput.value === '') return;
        
        const context = await SkyWayContext.Create(token);
        // 以下の関数はroomをフェッチしてくるか作成する関数
        const room = await SkyWayRoom.FindOrCreate(context, {
            type: 'p2p', // ここにはsfuかp2pを入れることで通信形式を決定することができる
            name: roomNameInput.value,
        });

        if(room){
            console.log("roomが入っている。");
        }

        // 作成、見つけてきたroomに入室する処理を加える。
        const me = await room.join();
        myId.textContent = me.id;

        // publishする項目を選択する事で、自分の映像や音声を送信することができる。
        await me.publish(audio);
        await me.publish(video);
        console.log("publish完了");
    

        // 相手の映像と音声のsubscribeを行う。
        // roomのpublicationsプロパティにroomに入っているpublicationプロパティが入っている。
        const subscribeAndAttach = (publication) => {
            // 3
            // 自分がpublishした場合ではない場合に限り先に進める。
            if (publication.publisher.id === me.id) return;

            // ボタンエリアに追加するボタンを作成する。
            const subscribeButton = document.createElement('button'); // 3-1
            subscribeButton.textContent = `${publication.publisher.id}: ${publication.contentType}`;
        
            buttonArea.appendChild(subscribeButton);

            //ボタンへのイベント設定を行なう
            subscribeButton.onclick = async () => {
                // 3-2
                // publicationをsubscribeすると、streamが返される。
                const { stream } = await me.subscribe(publication.id); // 3-2-1
            
                let newMedia; // 3-2-2
                // 返されたstreamの種類で処理を変える。
                switch (stream.track.kind) {
                    case 'video':
                        newMedia = document.createElement('video');
                        newMedia.playsInline = true;
                        newMedia.autoplay = true;
                        break;
                    case 'audio':
                        newMedia = document.createElement('audio');
                        newMedia.controls = true;
                        newMedia.autoplay = true;
                        break;
                    default:
                        return;
                }
                stream.attach(newMedia); // 3-2-3
                // 他のひとのstream見える状態にする。
                remoteMediaArea.appendChild(newMedia);
            };
        };
      
        room.publications.forEach(subscribeAndAttach); // 1
        
        // 誰かがpublishするたびにコールバック関数が実行される。
        room.onStreamPublished.add((e) => {
            // 2
            subscribeAndAttach(e.publication);
        });
    }


    
})(); // 1