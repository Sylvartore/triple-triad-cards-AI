import win32gui
import win32ui
import win32con
import win32api
from PIL import Image as image
from matplotlib import pyplot as plt


def windowCapture():
    hwnd = 0
    hwndDC = win32gui.GetWindowDC(hwnd)
    mfcDC = win32ui.CreateDCFromHandle(hwndDC)
    saveDC = mfcDC.CreateCompatibleDC()

    saveBitMap = win32ui.CreateBitmap()

    MoniterDev = win32api.EnumDisplayMonitors(None, None)
    w = MoniterDev[1][2][2]
    h = MoniterDev[1][2][3]

    saveBitMap.CreateCompatibleBitmap(mfcDC, w, h)

    saveDC.SelectObject(saveBitMap)
    saveDC.BitBlt((0, 0), (w, h), mfcDC, (0, 0), win32con.SRCCOPY)

    bmpinfo = saveBitMap.GetInfo()
    bmpstr = saveBitMap.GetBitmapBits(True)
    im = image.frombuffer(
        'RGB',
        (bmpinfo['bmWidth'], bmpinfo['bmHeight']),
        bmpstr, 'raw', 'BGRX', 0, 1)

    if __name__ == "__main__":
        plt.imshow(im)
        plt.show()
    return im


if __name__ == "__main__":
    windowCapture()
