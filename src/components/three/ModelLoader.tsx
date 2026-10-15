import { assetUrl } from "../../utils/assetUrl";
import { useLoader, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
// Shared cached GLTFs are retained across routes; R3F disposes route-owned geometry.
export function useModel(url: string) {
  const gl = useThree((s) => s.gl);
  return useLoader(GLTFLoader, url, (loader) => {
    loader.setMeshoptDecoder(MeshoptDecoder);
    const draco = new DRACOLoader().setDecoderPath(assetUrl("/decoders/draco/"));
    loader.setDRACOLoader(draco);
    const ktx = new KTX2Loader()
      .setTranscoderPath(assetUrl("/decoders/basis/"))
      .detectSupport(gl);
    loader.setKTX2Loader(ktx);
  });
}
