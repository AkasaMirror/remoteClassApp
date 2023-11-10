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
            type: 'p2p',
            name: roomNameInput.value,
        });

        const member = await room.join();
        myId.textContent = member.id;

        console.log("publishを試みます。");

        await member.publish(audio);
        await member.publish(video, {
            encodings: [
              // 複数のパラメータをセットする
              { maxBitrate: 10_000, scaleResolutionDownBy: 8 },
              { maxBitrate: 680_000, scaleResolutionDownBy: 1 },
            ],
            maxSubscribers : 99,
        });
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

            publicationsButton.onclick = async () => {
                console.log("publicationsボタンが押されました。");
                console.log("publications : " + room.publications);
                Object.keys(room.publications).forEach(function (key) {
                    console.log("room_publications :" + JSON.stringify(room.publications[key]));
                });
                console.log("publicationsボタンが正常に実行されました。");
            }

            subscriptionsButton.onclick = async () => {
                console.log("subscriptionsボタンが押されました。");
                Object.keys(room.subscriptions).forEach(function (key) {
                    console.log("room_subscriptions :" + JSON.stringify(room.subscriptions[key]));
                });
                console.log("subscriptionsボタンが正常に実行されました。");
            }

            roomMemberButton.onclick = async () => {
                console.log("room membersボタンが押されました。");
                Object.keys(room.members).forEach(function (key) {
                    console.log("room members :" + JSON.stringify(room.members[key]));
                });
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
            const unpub = document.getElementById("manual-un");

            unpub.onclick = () => {
                console.log("unpub()を実行します");
                member.unpublish(inputId.value);
                console.log("unpub()を実行しました");
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

        const subscribeAndAttach = (publication) => {
            if (publication.publisher.id === member.id) return;
    
            const subscribeButton = document.createElement('button');
            const unsubscribeButton = document.createElement('button');

            subscribeButton.textContent = `subscribe :  ${publication.publisher.id}: ${publication.contentType}`;
            unsubscribeButton.textContent = `unsubscribe : ${publication.publisher.id}: ${publication.contentType}`;
            buttonArea.appendChild(subscribeButton);
            buttonArea.appendChild(unsubscribeButton);
    
            subscribeButton.onclick = async () => {
                const { stream } = await member.subscribe(publication.id);
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
                        break;
                    default:
                        return;
                }
                stream.attach(newMedia);
                remoteMediaArea.appendChild(newMedia);
            };

            unsubscribeButton.onclick = async () => {
                const { stream } = await member.unsubscribe(subscription.id);
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
            }


        };
    
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
