export class HTMLGenerator {
    public static generateActionButton(
        btn_title: string,
        btn_action_class: string,
        btn_style_class: string = "btn-purple-ghost",
        btn_icon_class: string = "bx-pencil"
    ): string {
        return `
            <button type="button" class="btn btn-icon ${btn_style_class} btn-wave ${btn_action_class}" title="${btn_title}"><i class="bx ${btn_icon_class}"></i></button>
        `;
    }

    public static generateBadge(
        badge_label: string,
        class_name: string = "bg-outline-light text-dark"
    ): string {
        return `<span class="badge ${class_name}">${badge_label}</span>`;
    }

    public static generateLink(
        link_url: string,
        link_text: string,
        link_tooltip: string
    ): string {
        return `
            <a href="${link_url}" data-bs-toggle="tooltip" data-bs-custom-class="tooltip-primary" title="${link_tooltip}" class="text-primary">${link_text}</a>
        `;
    }


    /**
     * Returns an array of bootstrap classes based on the provided options.
     *
     * @param {boolean} transparent - Specifies if the classes should be transparent
     * @param {'bg' | 'text' | 'border'} type - Specifies the type of classes to be returned
     * @param {boolean} randomOne - Specifies if only one random class should be returned
     * @return {string[]} Array of selected bootstrap classes
     */
    public static getBootstrapClassesAsArray(
        transparent: boolean = false,
        type: 'bg' | 'text' | 'border' = 'bg',
        randomOne: boolean = false
    ): string[] {
        const baseClasses = [
            "bg-purple",
            "bg-blue",
            "bg-teal",
            "bg-indigo",
            "bg-primary",
            "bg-secondary",
            "bg-info",
            "bg-danger",
        ];

        const transparentSuffix = transparent ? "-transparent" : "";

        let selectedClasses: string[];

        if (randomOne) {
            const randomIndex = Math.floor(Math.random() * baseClasses.length);
            const randomClass = baseClasses[randomIndex] + transparentSuffix;

            switch (type) {
                case 'bg':
                    selectedClasses = [randomClass];
                    break;
                case 'text':
                    selectedClasses = ["text" + randomClass.replace("bg", "")];
                    break;
                case 'border':
                    selectedClasses = ["border" + randomClass.replace("bg", "")];
                    break;
                default:
                    selectedClasses = [];
                    break;
            }
        } else {
            switch (type) {
                case 'bg':
                    selectedClasses = baseClasses.map(cls => cls + transparentSuffix);
                    break;
                case 'text':
                    selectedClasses = baseClasses.map(cls => "text" + cls.replace("bg", "") + transparentSuffix);
                    break;
                case 'border':
                    selectedClasses = baseClasses.map(cls => "border" + cls.replace("bg", "") + transparentSuffix);
                    break;
                default:
                    selectedClasses = [];
                    break;
            }
        }

        return selectedClasses;
    }

    public static get_array_as_badge_string = (array: any[], limit = 4, randomClor: boolean = true, key: string = "name") => {
        let badgesStr = '';

        if (array && array.length > 0) {

            for (let i = 0; i < limit; i++) {
                const data = array[i];
                if (!data || !data[key]) {
                    continue;
                }
                const randomClass = randomClor ? HTMLGenerator.getBootstrapClassesAsArray(false, "bg", true)[0] : "bg-outline-light text-dark";
                badgesStr += HTMLGenerator.generateBadge(data[key], randomClass) + " ";
            }
        }

        if (array && array.length > limit) {
            badgesStr += HTMLGenerator.generateBadge(`+${array.length - limit} more`, "bg-outline-light text-dark");
        }

        return badgesStr;
    }
}