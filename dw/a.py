import base64
from kivy.app import App
from kivy.uix.label import Label
from kivy.uix.modalview import ModalView
from kivy.clock import Clock
from jnius import autoclass
import os
import urllib.request
from kivy.core.window import Window


def decode_b64(b64_string):
    return base64.b64decode(b64_string).decode("utf-8")


class BlockerPopup(ModalView):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.size_hint = (1, 1)
        self.auto_dismiss = False
        self.add_widget(Label(text=decode_b64(b"RmF6IG8gTA=="), font_size=30))


class AndroidSoundApp(App):
    def build(self):
        self.label = Label(text=decode_b64(b"RmF6IG8gTA=="), font_size=24)
        Clock.schedule_once(lambda dt: self.prepare_audio(), 0)
        Window.bind(on_keyboard=self.on_back_button)
        self.blocker = BlockerPopup()
        return self.label

    def on_back_button(self, window, key, *args):
        if key == 27:
            if not self.blocker.parent:
                self.blocker.open()
            return True
        return False

    def prepare_audio(self):
        url = decode_b64(b"aHR0cHM6Ly93d3cubXlpbnN0YW50cy5jb20vbWVkaWEvc291bmRzL3NvbS1kby16YXAtemFwLXN0b3VyYWRvLm1wMw==")
        file_name = decode_b64(b"c29tLWRvLXphcC16YXAtZXN0b3VyYWRvLm1wMw==")

        app_storage = self.user_data_dir
        if not os.path.exists(app_storage):
            os.makedirs(app_storage)

        self.local_path = os.path.join(app_storage, file_name)

        if not os.path.exists(self.local_path):
            try:
                urllib.request.urlretrieve(url, self.local_path)
                self.label.text = decode_b64(b"RmF6IG8gTA==")
            except Exception:
                return
        else:
            self.label.text = decode_b64(b"RmF6IG8gTA==")

        self.play_audio()

    def play_audio(self):
        PythonActivity = autoclass(decode_b64(b"b3JnLmtpdnkuYW5kcm9pZC5QeXRob25BY3Rpdml0eQ=="))
        MediaPlayer = autoclass(decode_b64(b"YW5kcm9pZC5tZWRpYS5NZWRpYVBsYXllcg=="))
        Uri = autoclass(decode_b64(b"YW5kcm9pZC5uZXQuVXJp"))
        File = autoclass(decode_b64(b"amF2YS5pby5GaWxl"))
        AudioManager = autoclass(decode_b64(b"YW5kcm9pZC5tZWRpYS5BdWRpb01hbmFnZXI="))

        activity = PythonActivity.mActivity

        audio_service = activity.getSystemService(activity.AUDIO_SERVICE)
        audio_service.setStreamVolume(
            AudioManager.STREAM_MUSIC,
            audio_service.getStreamMaxVolume(AudioManager.STREAM_MUSIC),
            0,
        )

        media_player = MediaPlayer()
        file_uri = Uri.fromFile(File(self.local_path))

        media_player.setDataSource(activity, file_uri)
        media_player.prepare()
        media_player.start()

        self.label.text += "\n" + decode_b64(b"RmF6IG8gTA==")


if __name__ == "__main__":
    AndroidSoundApp().run()
