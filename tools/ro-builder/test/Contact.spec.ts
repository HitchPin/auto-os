import { RoBuilder, toRoBuilder } from '../src/RoBuilder';

interface ContactDetail {
    City: string,
    State: string,
    AddressLine2: string,
    Country: string,
}


interface LowercaseContactDetail {
    city: string,
    state: string,
    AddressLine2: string,
    readonly Country: string,
}

const upperContact: ContactDetail = {
    City: 'Arlington',
    State: 'TX',
    AddressLine2: '1002 Hunter',
    Country: "US"
}
const lowerContact: LowercaseContactDetail = {
    city: 'Arlington',
    state: 'TX',
    AddressLine2: '1002 Hunter',
    Country: "US"
}

// @ts-expect-error
toRoBuilder(lowerContact).withCountry('asdf')

describe('Contact Tests', () => {

    test('Properties return as expected', () => {
        const contactUpper = toRoBuilder(upperContact);
        expect(contactUpper.City).toBe('Arlington');
        expect(contactUpper.State).toBe('TX');
        
        const contactLower = toRoBuilder(lowerContact);
        expect(contactLower.city).toBe('Arlington');
        expect(contactLower.state).toBe('TX');
    });

    test('Property setters result in changed value.', () => {
        const contactUpper = toRoBuilder(upperContact);
        const upperAfterWith = contactUpper.withCity('Dallas');
        expect(contactUpper.City).toBe(upperContact.City);
        expect(upperAfterWith.City).toBe('Dallas');
    });

    test('You can only set a property once.', () => {

        const contact = toRoBuilder(upperContact);
        const afterWith = contact.withCity('Dallas');
        let error: Error | undefined = undefined;
        try {
            (afterWith as any).withCity("Austin");
        } catch (err) {
            error = err as Error;
        }   
        expect(error!).toBeDefined();
        expect(error!.name).toBe('WithMethodMultipleInvocationsError');
        expect(error!.message).toBe(`The 'withCity' method was invoked multiple times.`);
    });

    test('Properties are read only and throw if you try to set them.', () => {
        const contact = toRoBuilder(upperContact);
        let error: Error | undefined = undefined;
        try {
            // @ts-ignore
            contact.AddressLine1 = 'asdf';
        } catch (err) {
            error = err as Error;
        }   
        
        expect(error!).toBeDefined();
        expect(error!.name).toBe('IllegalReadOnlyPropertyAccessError');
        expect(error!.message).toBe(`Using a builder turns all properties read-only. Try modifying the property 'AddressLine1' using the method named 'withAddressLine1'.`);
    });

    test('Does not mutate original.', () => {
        const original: ContactDetail = {
            City: 'Arlington',
            State: 'TX',
            AddressLine2: '1002 Hunter',
            Country: "US"
        };
        const contactUpper = toRoBuilder(original)
            .withCity("Dallas")
            .build();

        expect(original.City).toBe('Arlington');
        expect(contactUpper.City).toBe('Dallas');
    });
    test('Allows building.', () => {
        const built = toRoBuilder(upperContact)
            .withCity("Dallas")
            .build();
        expect(built.City).toBe('Dallas');
    });
});