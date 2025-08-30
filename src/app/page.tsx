import MultiDevicePlayer from '@/components/MultiDevicePlayer';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Multi-Device Audio Player
          </h1>
          {/*<p className="text-gray-600 text-lg">*/}
          {/*  Play different audio on different devices (excludes default device)*/}
          {/*</p>*/}
          {/*<p className="text-sm text-gray-500 mt-2">*/}
          {/*  🎵 Attempting device-specific routing - connect multiple USB/Bluetooth audio devices*/}
          {/*</p>*/}
        </div>
        
      <MultiDevicePlayer />
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            {/*Built with Next.js, Web Audio API, and MediaDevices API*/}
          </p>
        </div>
      </div>
    </div>
  );
}
