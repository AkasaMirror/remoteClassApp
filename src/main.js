// import { nowInSec, SkyWayAuthToken, SkyWayContext, SkyWayRoom, SkyWayStreamFactory, uuidV4 } from '@skyway-sdk/room';



// const token = new SkyWayAuthToken({
//     jti: uuidV4(),
//     iat: nowInSec(),
//     exp: nowInSec() + 60 * 60 * 24,
//     scope: {
//         app: {
//             id: '7ab8b490-382b-492e-bb0a-9324c3f9f86a',
//             turn: true,
//             actions: ['read'],
//             channels: [
//             {
//                 id: '*',
//                 name: '*',
//                 actions: ['write'],
//                 members: [
//                     {
//                         id: '*',
//                         name: '*',
//                         actions: ['write'],
//                         publication: {
//                             actions: ['write'],
//                         },
//                         subscription: {
//                             actions: ['write'],
//                         },
//                     },
//                 ],
//                 sfuBots: [
//                     {
//                         actions: ['write'],
//                         forwardings: [
//                             {
//                                 actions: ['write'],
//                             },
//                         ],
//                     },
//                 ],
//             },
//             ],
//         },
//     },
  
// }).encode('S6MaSxEOJoQlM9JnfgowvhVbdsWIV9bz4WKW7fsftzc=');



// (async () => {
//     // 1
//     const localVideo = document.getElementById('local-video');
//     const buttonArea = document.getElementById('button-area');
//     const remoteMediaArea = document.getElementById('remote-media-area');
//     const roomNameInput = document.getElementById('room-name');

//     const myId = document.getElementById('my-id');
//     const joinButton = document.getElementById('join');

//     const { audio, video } = await SkyWayStreamFactory.createMicrophoneAudioAndCameraStream(
//         {
//             video: { 
//                 height: 640,
//                 width: 360, 
//                 frameRate: 15 
//             },
//         }
//     ); //2

//     if(my_video_on) {
//         video.attach(localVideo); // 3
//         await localVideo.play(); // 4
//     }
//     // トークンからコンテクストを作成する。
//     // コンテクストには認証や認可ログの設定などの情報が格納されている。
//     // また、roomnameが入力されていない場合は先に進めないので処理を組み込む
//     joinButton.onclick = async () => {
//         console.log("joinボタンが押されました。")
//         if (roomNameInput.value === '') return;
        
//         const context = await SkyWayContext.Create(token);
//         context.onTokenUpdateReminder.add(() => {
//             context.updateAuthToken(tokenString);
//         });

//         // 以下の関数はroomをフェッチしてくるか作成する関数
//         const room = await SkyWayRoom.FindOrCreate(context, {
//             type: 'sfu', // ここにはsfuかp2pを入れることで通信形式を決定することができる
//             name: roomNameInput.value,
//         });

//         if(room){
//             console.log("roomが入っている。");
//         } else {
//             console.log("roomが入っていない。")
//         }

//         // 作成、見つけてきたroomに入室する処理を加える。
//         const member = await room.join();
//         myId.textContent = member.id;

//         // publishする項目を選択する事で、自分の映像や音声を送信することができる。
//         await member.publish(audio);
//         await member.publish(video, {
//             encodings: [
//               // 複数のパラメータをセットする
//               { maxBitrate: 10_000, scaleResolutionDownBy: 8 },
//               { maxBitrate: 680_000, scaleResolutionDownBy: 1 },
//             ],
//             maxSubscribers : 99,
//           });
//         console.log("publish完了");
        

//         // 相手の映像と音声のsubscribeを行う。
//         // roomのpublicationsプロパティにroomに入っているpublicationプロパティが入っている。
//         const subscribeAndAttach = (publication) => {
//             // 3
//             // 自分がpublishした場合ではない場合に限り先に進める。
//             if (publication.publisher.id === member.id) return;

//             // ボタンエリアに追加するボタンを作成する。
//             const subscribeButton = document.createElement('button'); // 3-1
//             subscribeButton.textContent = `${publication.publisher.id}: ${publication.contentType}`;
        
//             buttonArea.appendChild(subscribeButton);

//             //ボタンへのイベント設定を行なう
//             subscribeButton.onclick = async () => {
//                 // 3-2
//                 // publicationをsubscribeすると、streamが返される。
//                 const { stream } = await member.subscribe(publication.id); // 3-2-1
            
//                 let newMedia; // 3-2-2
                
//                 // 返されたstreamの種類で処理を変える。
//                 switch (stream.track.kind) {
//                     case 'video':
//                         newMedia = document.createElement('video');
//                         newMedia.playsInline = true;
//                         newMedia.autoplay = true;
//                         break;
//                     case 'audio':
//                         newMedia = document.createElement('audio');
//                         newMedia.controls = true;
//                         newMedia.autoplay = true;
//                         break;
//                     default:
//                         return;
//                 }
//                 stream.attach(newMedia); // 3-2-3
//                 // 他のひとのstream見える状態にする。
//                 remoteMediaArea.appendChild(newMedia);
//             };
//         };
      
//         room.publications.forEach(subscribeAndAttach); // 1
        
//         // 誰かがpublishするたびにコールバック関数が実行される。
//         room.onStreamPublished.add((e) => {
//             // 2
//             subscribeAndAttach(e.publication);
//         });
//     }


    
// })(); // 1

import { nowInSec, SkyWayAuthToken, SkyWayContext, SkyWayRoom, SkyWayStreamFactory, uuidV4 } from '@skyway-sdk/room';

const videoButton = document.getElementById("videoButton");
const audioButton = document.getElementById("audioButton");

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
    const roomButtonArea = document.getElementById('room-button-area');
    const remoteMediaArea = document.getElementById('remote-media-area');
    const roomNameInput = document.getElementById('room-name');

    const myId = document.getElementById('my-id');
    const joinButton = document.getElementById('join');

    const { audio, video } = await SkyWayStreamFactory.createMicrophoneAudioAndCameraStream(
        {
            video: { 
                height: 640,
                width: 360, 
                frameRate: 15 
            },
        }
    ); //2
    
    let my_video_on = true;
    let my_audio_on = true;

    if(my_video_on) {
        video.attach(localVideo); // 3
        await localVideo.play(); // 4
    }

    // トークンからコンテクストを作成する。
    // コンテクストには認証や認可ログの設定などの情報が格納されている。
    // また、roomnameが入力されていない場合は先に進めないので処理を組み込む
    joinButton.onclick = async () => {
        console.log("joinボタンが押されました。")
        if (roomNameInput.value === '') return;
        
        const context = await SkyWayContext.Create(token);

        //トークンの自動更新
        context.onTokenUpdateReminder.add(() => {
            context.updateAuthToken(tokenString);
        });

        // 以下の関数はroomをフェッチしてくるか作成する関数
        const room = await SkyWayRoom.FindOrCreate(context, {
            type: 'sfu', // ここにはsfuかp2pを入れることで通信形式を決定することができる
            name: roomNameInput.value,
        });

        if(room){
            console.log("roomが入っている。");
        } else {
            console.log("roomが入っていない。")
        }

        // 作成、見つけてきたroomに入室する処理を加える。
        const member = await room.join();

        const exitButton = document.createElement('button');
        exitButton.textContent = "exit";
        roomButtonArea.appendChild(exitButton);
        exitButton.onclick = async () => {
            console.log("exitボタンが押されました。");
            member.leave();
            console.log("exit処理が正常に実行されました。");
        }
        const closeButton = document.createElement('button');
        closeButton.textContent = "close";
        roomButtonArea.appendChild(closeButton);
        closeButton.onclick = async () => {
            room.close();
        }

        myId.textContent = member.id;
        // publishする項目を選択する事で、自分の映像や音声を送信することができる。
        await member.publish(audio);
        await member.publish(video, {
            encodings: [
              // 複数のパラメータをセットする
              { maxBitrate: 10_000, scaleResolutionDownBy: 8 },
              { maxBitrate: 680_000, scaleResolutionDownBy: 1 },
            ],
            maxSubscribers : 99,
        });
        let unVideo = document.getElementById("unpublish-video");
        let unAudio = document.getElementById("unpublish-audio");
        unVideo.onclick = async() => {
            console.log("videoのunpublishを試みました。");
            member.unpublish(video);
            console.log("videoのunpublishを実行しました。");
        }

        unAudio.onclick = async() => {
            console.log("audioのunpublishを試みました。");
            member.unpublish(audio);
            console.log("audioのunpublishを実行しました。");
        }
        console.log("publish完了");


        

        // 相手の映像と音声のsubscribeを行う。
        // roomのpublicationsプロパティにroomに入っているpublicationプロパティが入っている。
        const subscribeAndAttach = (publication) => {
            // 3
            // 自分がpublishした場合ではない場合に限り先に進める。
            if (publication.publisher.id === member.id) return;


            // ボタンエリアに追加するボタンを作成する。
            const subscribeButton = document.createElement('button'); // 3-1
            const deleteButton = document.createElement('button');
            subscribeButton.textContent = `subscribe ${publication.publisher.id}: ${publication.contentType}`;
            deleteButton.textContent = `delete ${publication.publisher.id}: ${publication.contentType}`;
            buttonArea.appendChild(subscribeButton);
            buttonArea.appendChild(deleteButton);

            //ボタンへのイベント設定を行なう
            subscribeButton.onclick = async () => {
                // 3-2
                // publicationをsubscribeすると、streamが返される。
                const { stream } = await member.subscribe(publication.id); // 3-2-1
            
                let newMedia; // 3-2-2
                
                // 返されたstreamの種類で処理を変える。
                switch (stream.track.kind) {
                    case 'video':
                        newMedia = document.createElement('video');
                        newMedia.playsInline = true;
                        newMedia.autoplay = true;
                        deleteButton.onclick = async () => {
                            newMedia.playsInline = false;
                            newMedia.autoplay = false;
                        }
                        break;
                    case 'audio':
                        newMedia = document.createElement('audio');
                        newMedia.controls = true;
                        newMedia.autoplay = true;
                        deleteButton.onclick = async () => {
                            newMedia.controls = false;
                            newMedia.autoplay = false;
                        }
                        break;
                    default:
                        return;
                }
                stream.attach(newMedia); // 3-2-3
                // 他のひとのstream見える状態にする。
                remoteMediaArea.appendChild(newMedia);
            };


        };
      
        //room.publicationsの要素を一つずつ取得して引数の関数に渡してあげる。
        room.publications.forEach(subscribeAndAttach); // 1
        
        
        // 誰かがpublishするたびにコールバック関数が実行される。
        room.onStreamPublished.add((e) => {
            // 2
            subscribeAndAttach(e.publication);
        });
    }
    




    videoButton.onclick = async () => {
        console.log(videoButton.textContent + "が押されました。");
        const mediaOn = "video on";
        const mediaOff = "video off";
        if(my_video_on) {

            console.log("videoをdetachします。");
            video.detach();
            console.log("videoをdetachしました。");

            console.log("videoをreleaseします。");
            video.release();
            console.log("videoをrelaeseしました。");
            
            console.log(videoButton.textContent + "の処理を行いました。");
            videoButton.textContent = mediaOn;
            my_video_on = false;
            
        } else {

            console.log("videoをattachします。");
            video.attach(localVideo); // 3
            console.log("videoをattachしました。");
            
            await localVideo.play();
            console.log(videoButton.textContent + "の処理を行いました。");
            videoButton.textContent = mediaOff;
            my_video_on = true;
            
        }
        console.log(videoButton.textContent + "の処理を行いました。");
    }

    audioButton.onclick = async () => {
        console.log(audioButton.textContent + "が押されました。");
        const mediaOn = "audio on";
        const mediaOff = "auido off";
        if(my_audio_on) {
            audioButton.textContent = mediaOff;
            my_audio_on = false;
        } else {
            audioButton.textContent = mediaOn;
            my_audio_on = true;
        }
        console.log(audioButton.textContent + "の処理を行いました。");
    }

})(); // 1

