import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Stage, Text, usePixiApp, usePixiTicker } from "react-pixi-fiber";
import {
  CustomPIXIComponent,
  CustomPIXIComponentBehaviorDefinition,
} from "react-pixi-fiber";
import * as PIXI from "pixi.js";
import React from "react";
const TYPE = "Rectangle";
type Props = {
  fill: number;
  x: number;
  y: number;
  width: number;
  height: number;
};
interface A {
  a?: number;
}
const a: A = {};
export const behavior: CustomPIXIComponentBehaviorDefinition<
  PIXI.Graphics,
  Props
> = {
  customDisplayObject: (props) => new PIXI.Graphics(),
  customApplyProps: function (instance, oldProps, newProps) {
    const { fill, x: x, y: y, width, height } = newProps;
    instance.clear();
    instance.beginFill(fill);
    instance.drawRect(x, y, width, height);
    instance.endFill();
  },
};
const Unko = CustomPIXIComponent(behavior, TYPE);
// returns a base 10 translation of a gray scale hex string build from a single
// number between 0 and 255. if num is > 255 or < 0 it's clamped to the limit.
const grayFromNum = (num) => {
  const hex = ("00" + Math.max(0, Math.min(255, num)).toString(16)).substr(-2);
  return parseInt(`${hex.repeat(3)}`, 16);
};

/**
 * Implements `react-pixi-fiber`'s `usePixiTicker` hook, and the `useState` hook.
 * Handles animation of the circle and square background.
 */

function useAnimatedValue({ direction, max, min, value }) {
  const [data, setData] = useState({
    direction,
    value,
  });
  const { ticker } = usePixiApp();

  usePixiTicker(
    () => {
      // perform all the logic inside setData so useEffect's dependency array
      // can be empty so it will only trigger one on initial render and not
      // add and remove from ticker constantly.
      setData((current) => {
        const data = { ...current };

        // flip direction once min or max has been reached.
        if (
          (current.value >= max && current.direction === 1) ||
          (current.value <= min && current.direction === -1)
        ) {
          data.direction *= -1;
        }

        // increment or decrement `
        data.value += data.direction;

        return data;
      });
    } //, [direction, max, min, value, setData]
  );

  return data.value;
}

const AnimationContext = createContext({ title: "" });

/**
 * implements `useContext`, `useLayoutEffect` and `useRef`.
 */
const Title = () => {
  const { title } = useContext(AnimationContext);
  const pixiText = useRef(null);

  // horizontally center the title's pivot point. this also works fine with `useEffect`.
  useLayoutEffect(() => {
    pixiText.current.pivot.set(pixiText.current.width / 2, 0);
  }, [title]);

  return <Text ref={pixiText} text={title} x={400} y={0} />;
};

const Animation = () => {
  const number1 = useAnimatedValue({
    direction: 1,
    max: 255,
    min: 0,
    value: 0,
  });
  const number2 = useAnimatedValue({
    direction: -1,
    max: 255,
    min: 0,
    value: 255,
  });
  const [text1, setText1] = useState(`number1: ${number1}`);
  const [text2, setText2] = useState(`number2: ${number2}`);

  // update the contents of the `Text` instances.
  useEffect(() => {
    setText1(`number1: ${number1}`);
    setText2(`number2: ${number2}`);
  }, [number1, number2]);

  return (
    <>
      <Title />
      <Unko
        x={275}
        y={175}
        width={250}
        height={250}
        fill={grayFromNum(number1)}
      />
    </>
  );
};

const HooksExample = () => {
  if (typeof useState === "function") {
    return (
      <Stage width={800} height={600} options={{ backgroundColor: 0xff0000 }}>
        <AnimationContext.Provider value={{ title: "animation" }}>
          <Animation />
        </AnimationContext.Provider>
      </Stage>
    );
  } else {
    return (
      <Stage width={800} height={600} options={{ backgroundColor: 0xff0000 }}>
        <Text
          text={`Sorry, your version of React (${React.version}) doesn't support hooks.`}
          x={0}
          y={500}
        />
      </Stage>
    );
  }
};

export default HooksExample;
