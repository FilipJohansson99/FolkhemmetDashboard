type SearchInputProps = {
    // eslint-disable-next-line no-unused-vars
    onInputChange: (inputValue: string) => any;
    onKeypressed: (key: any) => any;
    text: string;

}
let currentTimeout;
let lastValue;
const keypressed = function (key, f: any) {
    if (key !== "Enter") return
    f(lastValue)
}
const search = function (e, f: any) {
    lastValue = e;
    if (e === "") {
        f(lastValue)
        return;
    }
    console.log(lastValue)
    if (currentTimeout) return;
    currentTimeout = setTimeout(() => {
        f(lastValue)

        clearTimeout(currentTimeout);
        currentTimeout = null;
    }, 2000);
}
const SearchInput = ({ onInputChange, onKeypressed, text }: SearchInputProps) => (

    <label htmlFor="search-input" className=" md:w-900 lg:w-700 w-200 relative py-2 px-8 text-white border-white border-2 rounded-full flex items-center gap-4 w-80">
        <svg className="h-5 stroke-current fill-transparent flex-shrink-0" viewBox="0 0 29 30">
            <path
                d="M28 28.5L21.6252 22.1138M25.1579 13.5789C25.1579 16.7825 23.8853 19.8548 21.6201 22.1201C19.3548 24.3853 16.2825 25.6579 13.0789 25.6579C9.87541 25.6579 6.80308 24.3853 4.53784 22.1201C2.2726 19.8548 1 16.7825 1 13.5789C1 10.3754 2.2726 7.30308 4.53784 5.03784C6.80308 2.7726 9.87541 1.5 13.0789 1.5C16.2825 1.5 19.3548 2.7726 21.6201 5.03784C23.8853 7.30308 25.1579 10.3754 25.1579 13.5789Z"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>

        <input
            id="search-input" //
            className="rounded-full bg-transparent text-lg focus:outline-none w-full"
            type="search"
            name="search"
            placeholder={text}
            onKeyDown={(e) => keypressed(e.key, onInputChange)}
            onChange={(e) => search(e.target.value, onInputChange)}
        />
    </label>
);

export default SearchInput;
