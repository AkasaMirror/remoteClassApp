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
    const localVideo = document.getElementById('local-video');
    const buttonArea = document.getElementById('button-area');
    const roomButtonArea = document.getElementById('room-button-area');
    const unpublicationArea = document.getElementById('unpublication-area');
    const roomInformationArea = document.getElementById('room-information-area');
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
        console.log("local videoを実行する。");
        video.attach(localVideo); // 3
        await localVideo.play(); // 4
        console.log("local videoを実行しました。");
    } else {
        console.log("local videoが作動されませんでした。");
    }

    // トークンからコンテクストを作成する。
    // コンテクストには認証や認可ログの設定などの情報が格納されている。
    // また、roomnameが入力されていない場合は先に進めないので処理を組み込む
    joinButton.onclick = async () => {
        
        console.log("joinボタンが押されました。");

        if (roomNameInput.value === '') {
            console.log("room名が入力されていません。");
            return;
        }
    
        const context = await SkyWayContext.Create(token);
        const room = await SkyWayRoom.FindOrCreate(context, {
            type: 'sfu',
            name: roomNameInput.value,
        });

        const member = await room.join();
        console.log("member : " + member);
        myId.textContent = member.id;

        console.log("publishを試みます。");

        const publication_audio = await member.publish(audio);
        const publication_video = await member.publish(video, {
            encodings: [
              // 複数のパラメータをセットする
              { maxBitrate: 10_000, scaleResolutionDownBy: 8 },
              { maxBitrate: 680_000, scaleResolutionDownBy: 1 },
            ],
            maxSubscribers : 99,
        });
        console.log("以下のものはaudioの情報");
        console.log(publication_audio);
        console.log("以下のものはvideoの情報")
        console.log(publication_video)
        console.log(member);
        console.log("publish正常に実行されました。");

        const createExitandCloseButton = () => {
            console.log("createExitandCloseButton()を実行します。");

            const exitButton = document.createElement("button");
            const closeButton = document.createElement("button");

            exitButton.textContent = "exit";
            closeButton.textContent = "close";

            roomButtonArea.appendChild(exitButton);
            roomButtonArea.appendChild(closeButton);

            exitButton.onclick = async () => {
                console.log("exitボタンが押されました");
                member.leave();
                console.log("exit処理が正常に実行されました。");
                exitButton.remove();
                closeButton.remove();
                console.log("ボタンを削除しました。");
            }
        

            closeButton.onclick = async () => {
                console.log("closeボタンが押されました");
                console.log("room-member : " + room.members);
                member.leave();
                console.log("close処理が正常に実行されました。");
                exitButton.remove();
                closeButton.remove();
                console.log("ボタンを削除しました。");
                console.log("room-member : " + room.members);
            }

            console.log("createExitandCloseButton()が実行されました。");
        }
        const createRoomInformationButton = () => {
            console.log("createRoomInformationButton()を実行します。");
            if(roomInformationArea.firstChild) {
                console.log("先に生成された子ノードを削除します");

                while (roomInformationArea.firstChild) {
                    console.log(roomInformationArea.firstChild)
                    roomInformationArea.removeChild(roomInformationArea.firstChild);
                }
                console.log("先に生成された子ノードを削除しました");
            }
            const publicationsButton = document.createElement("button");
            const subscriptionsButton = document.createElement("button");
            const roomMemberButton = document.createElement("button");

            publicationsButton.textContent = "publications";
            subscriptionsButton.textContent = "subscriptions";
            roomMemberButton.textContent = "room members";

            roomInformationArea.appendChild(publicationsButton);
            roomInformationArea.appendChild(subscriptionsButton);
            roomInformationArea.appendChild(roomMemberButton);

            publicationsButton.onclick = () => {
                console.log("publicationsボタンが押されました。");
                console.log("publications : " + room.publications);
                console.log(room.publications);
                Object.keys(room.publications).forEach(function (key) {
                    console.log("room_publications :" + JSON.stringify(room.publications[key]));
                });
                console.log(JSON.stringify(room.publications));
                console.log("publicationsボタンが正常に実行されました。");
            }

            subscriptionsButton.onclick = () => {
                console.log("subscriptionsボタンが押されました。");
                Object.keys(room.subscriptions).forEach(function (key) {
                    console.log("room_subscriptions :" + JSON.stringify(room.subscriptions[key]));
                });
                console.log(JSON.stringify(room.subscriptions));
                console.log("subscriptionsボタンが正常に実行されました。");
            }

            roomMemberButton.onclick = () => {
                console.log("room membersボタンが押されました。");
                Object.keys(room.members).forEach(function (key) {
                    console.log("room members :" + JSON.stringify(room.members[key]));
                });
                console.log(JSON.stringify(room.members));
                console.log("room membersボタンが正常に実行されました。");
            }
            console.log("createRoomInformationButton()が実行されました。");
        }
        const createUnpublicationButton = () => {
            console.log("createUnpublishButton()を実行します。");
            
            if(unpublicationArea.firstChild) {
                console.log("先に生成された子ノードを削除します");

                while (unpublicationArea.firstChild) {
                    console.log(unpublicationArea.firstChild)
                    roomInformationArea.removeChild(unpublicationArea.firstChild);
                }
                console.log("先に生成された子ノードを削除しました");
            }
            const unpublishAudioButton = document.createElement('button');
            const unpublishVideoButton = document.createElement('button');

            unpublishAudioButton.textContent = "unpublish audio";
            unpublishVideoButton.textContent = "unpublish video";

            unpublicationArea.appendChild(unpublishAudioButton);
            unpublicationArea.appendChild(unpublishVideoButton);

            unpublishAudioButton.onclick = async () => {
                console.log("unpublishAudio()が実行されます");
                member.unpublish(audio);
                console.log("unpublishAudio()が実行されました");
            }

            unpublishVideoButton.onclick = async () => {
                console.log("unpublishVideo()が実行されます");
                member.unpublish(video);
                console.log("unpublishVideo()が実行されました");
            }
            console.log("createUnpublishButton()を実行しました。");
        }
        const manualUnpublish = () => {
            console.log("manualUnpublish()を実行します");
            const inputId = document.getElementById("input-id");
            const clearButton = document.getElementById("input-clear");
            const manualAudio = document.getElementById("manual-audio");
            const manualVideo = document.getElementById("manual-video");
            const subsc = document.getElementById("manual-sub");
            const unpub = document.getElementById("manual-un");

            unpub.onclick = () => {
                console.log("unpub()を実行します");
                member.unpublish(inputId.value);
                console.log("unpub()を実行しました");
            }
            subsc.onclick = async () => {
                console.log("subsc()を実行します");
                await member.subscribe(inputId.value);
                console.log("subsc()を実行しました");
            }

            clearButton.onclick = () => {
                console.log("clear()を実行します");
                inputId.value = "";
                console.log("clear()を実行しました");
            }

            console.log("manualUnpublish()を実行しました");
        }
        const manualUnsubscribe = () => {
            console.log("manualUnsubscribe()を実行します");
            const inputId = document.getElementById("input-id");
            const unsub = document.getElementById("manual-unsub");

            unsub.onclick = () => {
                console.log("unsub()を実行します");
                member.unsubscribe(inputId.value);
                console.log("unsub()を実行しました");
            }

            console.log("manualUnsubscribe()を実行しました");
        }

        createExitandCloseButton();
        createRoomInformationButton();
        createUnpublicationButton();
        manualUnpublish();
        manualUnsubscribe();

        const subscribeAndAttach = async (publication) => {
            if (publication.publisher.id === member.id) {
                const { subscription, stream } = await member.subscribe(publication.id);
                console.log(subscription);
                return;
            };
    
            const subscribeButton = document.createElement('button');
            const unsubscribeButton = document.createElement('button');

            subscribeButton.textContent = `subscribe :  ${publication.publisher.id}: ${publication.contentType}`;
            unsubscribeButton.textContent = `unsubscribe : ${publication.publisher.id}: ${publication.contentType}`;

            subscribeButton.className = `${publication.publisher.id}`;
            unsubscribeButton.className = `${publication.publisher.id}`;


            buttonArea.appendChild(subscribeButton);
            buttonArea.appendChild(unsubscribeButton);
    
            subscribeButton.onclick = async () => {
                console.log("subscribeButton()が押されました。");
                const { subscription, stream } = await member.subscribe(publication.id);
                console.log("subscription : ");
                console.log(subscription);
                let newMedia;
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
                        newMedia.style.display = "none";
                        break;
                    default:
                        return;
                }
                unsubscribeButton.onclick = async () => {
                    console.log("unsunscribeButton()が押されました。");
                    member.unsubscribe(subscription.id);
                    newMedia.remove();
                    console.log("unsunscribeButton()が正常に実行されました。");
                }
                newMedia.className = `${publication.publisher.id}_remoteMedia`;
                stream.attach(newMedia);
                remoteMediaArea.appendChild(newMedia);
                console.log("subscribeButton()が実行されました。");
            };

        };

        const deleteSubscribeAndUnsubscribe = (member) => {
            console.log("イベントが発火されました。");

            console.log("member : " + member);
            let buttons = document.getElementsByClassName(member.id);
            let remoteMedias = document.getElementsByClassName(member.id + "_remoteMedia");

            console.log("buttonArea : ");
            console.log(buttonArea);

            console.log("buttons" + buttons);
            for(let i=0, len=buttons.length; i < len; i++){
                console.log(buttons[i]);
                buttons[i].remove();
            }


            for(let i=0, len=remoteMedias.length; i < len; i++){
                console.log(remoteMedias[i]);
                remoteMedias[i].remove();
            }
            
            
            console.log("イベントの発火が終了しました。");

        }
        
        room.onMemberLeft.add((e) => deleteSubscribeAndUnsubscribe(e.member));
        room.onClosed.add((e) => deleteSubscribeAndUnsubscribe(e.member));

        room.publications.forEach(subscribeAndAttach);
        room.onStreamPublished.add((e) => subscribeAndAttach(e.publication));
    };

    videoButton.onclick = async () => {
        console.log(videoButton.textContent + "が押されました。");
        const mediaOn = "video on";
        const mediaOff = "video off";
        if(my_video_on) {
            video.detach(localVideo); // 3
            videoButton.textContent = mediaOff;
            my_video_on = false; 
        } else {
            video.attach(localVideo); // 3
            await localVideo.play();
            videoButton.textContent = mediaOn;
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

})();