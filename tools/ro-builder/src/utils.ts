const flipChar = (s: string) => {
    if (s.length !== 1) {
        throw new Error('Must be a string with length 1.');
    }
    if (s.toLocaleUpperCase() === s) {
        return s.toLocaleLowerCase();
    } else {
        return s.toLocaleUpperCase();
    }
}
export const flipFirstCase = (s: string) => {
    if (!s || s.length === 0) {
      return s;
    }
    const f = s[0];
    return flipChar(f) + s.substring(1);
}
  
export const getPropertySetterByInsensitiveFirstCharCase = (instance: object, possibleName: string) => {
    let propertyName: string = possibleName;
    let pd: PropertyDescriptor = Object.getOwnPropertyDescriptor(instance, possibleName);
    if (!pd) {
        propertyName = flipFirstCase(possibleName);
        Object.getOwnPropertyDescriptor(instance, propertyName)

        if (!pd) {
            throw new Error(`Cannot find property ${possibleName} or ${flipFirstCase} on object:\n${instance}.`);
        }
    }

    if (pd.set) { 
        return (v) => pd.set(v);
    } else if (pd.writable) {
        return (v) => {
            instance[propertyName] = v;
        }
    }
}