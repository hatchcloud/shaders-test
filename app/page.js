
import dynamic from 'next/dynamic';
const ThreeImageEffect = dynamic(() => import('../app/components/ThreeScene'), { ssr: false });
const ThreeSceneGrid = dynamic(() => import('../app/components/ThreeSceneGrid'), { ssr: false });

export default function Home() {
  return (
    <main className='flex flex-col md:flex-row items-center justify-center h-screen w-screen gap-7'>
      <div id="imageContainer" style={{ width: '600px', height: '600px' }} className='overflow-hidden' >
        <ThreeImageEffect imageUrl="/cuadrado.png"/>
      </div>
      <div id="imageContainer2" style={{ width: '600px', height: '600px' }} className='overflow-hidden' >
        <ThreeSceneGrid imageUrl="/cuadrado.png"/>
      </div>
    </main>
  );
}
