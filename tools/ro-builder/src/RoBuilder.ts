import { getPropertySetterByInsensitiveFirstCharCase } from './utils';
import * as errors from './errors';
import type { ExcludeReadonly } from './typeUtils';

type OneShotBuilder<TOrig, TInterface, AlreadySupplied extends (keyof ExcludeReadonly<TInterface>)[]=[]> = {
  [k in keyof Omit<ExcludeReadonly<TInterface>, AlreadySupplied[number]> as `with${Capitalize<string & k>}`]-?: (v: ExcludeReadonly<TInterface>[k]) => Readonly<TInterface> & OneShotBuilder<TOrig, TInterface, [...AlreadySupplied, k]> & BuildOf<TOrig>
}
type BuildOf<T> = {
  build: () => T
}
type WithBuilder<TOrig, TCur> = Readonly<TCur> & OneShotBuilder<TOrig, TCur> & BuildOf<TCur>
type NoUndefinedField<T> = { [P in keyof T]-?: NoUndefinedField<NonNullable<T[P]>> };

class RoBuilder<TOrig, TDetail extends Record<string, any>> {
  #cd: TDetail;

  private constructor(cd: TDetail, withCalledAlready?: Set<string>) {
    this.#cd = cd;
    const that = this;
    const withers = new Set<string>(withCalledAlready) ?? new Set<string>();
    return new Proxy<RoBuilder<TOrig, TDetail>>(this as unknown as RoBuilder<TOrig, TDetail>, {
      get: function (target: RoBuilder<TOrig, TDetail>, name: string | number | symbol, value) {
        console.log(`Got req for ${String(name)} on ${target}`);
        
        const propName = <keyof TDetail>name;
        if (typeof(propName) === 'string' && propName === 'build') {
          return () => {
            const newCd = <TDetail>Object.assign({}, that.#cd);
            return newCd;
          }
        } else if (typeof(propName) === 'string' && propName.startsWith('with')) {
          const witherName = propName;
          const underlyingProp = witherName.substring(4);
          if (withers.has(witherName)) {
            throw new errors.WithMethodMultipleInvocationsError(witherName);
          }
          return (v: any) => {
            withers.add(propName);
            const newCd = <TDetail>Object.assign({}, that.#cd);
            const setter = getPropertySetterByInsensitiveFirstCharCase(newCd, underlyingProp);
            setter(v);
            return new RoBuilder<TOrig, TDetail>(newCd, withers);
          };
        }

        const returnVal = Reflect.get(target.#cd, name, value);
        return returnVal;
      },
      set: function(target, p, newValue, receiver): boolean {
          if (typeof(p) !== 'string') {
            return false;
          }
          if (p.startsWith('with')) {
            throw new errors.IllegalWitherModificationAttemptError(p);
          }
          throw new errors.IllegalReadOnlyPropertyAccessError(p, 'with' + p[0].toLocaleUpperCase() + p.substring(1));
      },
    });
  }

}

const toRoBuilder = <T>(v: T): WithBuilder<T, T> => {
  const vc = Object.assign({}, v);
  const withPublicConstruct = RoBuilder as { new(c: T): RoBuilder<T, T>};
  return new withPublicConstruct(vc) as unknown as WithBuilder<T, T>;
}

export { toRoBuilder, RoBuilder };