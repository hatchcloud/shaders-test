
import dynamic from 'next/dynamic';
const ThreeScene = dynamic(() => import('../app/components/ThreeScene'), { ssr: false });

export default function Home() {
  return (
    <main className='flex items-center justify-center h-screen w-screen'>
      <div id="imageContainer "style={{ width: '600px', height: '600px' }}>
        <ThreeScene imageUrl="/cuadrado.png"/>
      </div>
    </main>
  );
}
