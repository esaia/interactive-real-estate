=== Interactive Real Estate ===
Contributors: esaia
Tags: interactive, real estate, property display, SVG, hotspots, floor plan, real estate plugin, property listing, interactive buildings, pins, polygon, svg  
Requires at least: 5.0
Tested up to: 6.7
Stable tag: 1.6
Plugin URI: https://interactive-real-estate.vercel.app/
License: GPL2
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Create interactive buildings with clickable hotspots and layers. A great way to display floor plans, property displays like area, price, room count, and 2D/3D plans and more. No coding required.

== Description ==
[Live Demo Front](https://interactive-real-estate.vercel.app/demos) | [Module Demo](https://interactive-real-estate.vercel.app/module) | [Support](https://interactive-real-estate.vercel.app/contact)

Interactive Real Estate is the most innovative WordPress plugin for creating interactive buildings and property displays. With easy-to-use shortcodes and a sleek admin interface, this plugin allows users to create stunning interactive building with easy navigation through different building layers, users can get detailed information about each unit directly from the visual interface. Quickly add pins, vector shapes, and tooltips to any image, all without needing to write any code.

With easy navigation through different building layers, users can get detailed information about each unit directly from the visual interface.

**Key Features:**
- **Interactive Building:** You can easily draw and edit complex shapes on your image right in the editor, without needing any external programs like Illustrator. Simply add pins and combine different shapes together..
- **Hotspot Creation:** Add clickable hotspots to specific units or areas within the building for detailed information.
- **Multiple Layers:** Easily navigate between different building layers (e.g., floors, units) with smooth transitions.
- **Customizable Shortcodes:** Use the `[irep_building]` shortcode to embed your interactive maps and customize them with your specific data.
- **Easy-to-Use Admin Interface:** Intuitive settings page to upload building images, configure hotspots, and manage map settings.

With the **Interactive Real Estate** plugin, you'll be able to provide a truly immersive experience for prospective buyers or tenants, setting your property listings apart from traditional static images or floor plans.

== Installation ==
1. Install using the WordPress built-in Plugin installer or Download zip file from WordPress.org.
2. `Activate Plugin` to enable the plugin.
3. Go to the plugin settings page under **Interactive Real Estate** in the WordPress dashboard.  

== Frequently Asked Questions ==
= How do I use the Interactive Real Estate features? =
To create an interactive building, use the `[irep_building]` shortcode. You can customize the building map by uploading images and adding interactive hotspots through the plugin's settings page.

= Can I use this plugin for multiple buildings? =  
Yes, the plugin supports creating interactive maps for multiple buildings or properties. You can manage each building's settings individually and display them anywhere on your site using shortcodes.

= Do I need to know how to code? =  
No, the plugin is designed to be easy to use, even for non-technical users. The admin interface is simple and intuitive, and you can get started by just uploading your images and using the shortcode.

= Is there a demos available? =
Yes, visit [https://interactive-real-estate.vercel.app/demos](https://interactive-real-estate.vercel.app/demos) to view a live demo of the plugin in action.

Have Questions? We've Got Answers in [documentation](https://interactive-real-estate.vercel.app/doc)

== Plugin Support ==
For support, please visit our support page [https://interactive-real-estate.vercel.app/contact](https://interactive-real-estate.vercel.app/contact). If you encounter any issues, feel free to contact us via email at interactiverealestateplugin@gmail.com.

== License ==
Interactive Real Estate is licensed under the GPL2 license. For more information, refer to the [GPL2 License](http://www.gnu.org/licenses/gpl-2.0.html).

== Screenshots ==
1. Banner: [banner-1540x500.jpg]
2. Plugin icon: [icon-512x512.png]
3. Main dashboard view: [screenshot-1.jpg]
4. Flats list: [screenshot-2.png]
5. 3d floor plan: [screenshot-3.jpg]
6. Edit flat: [screenshot-4.jpg]
7. Result: [screenshot-5.jpg]

== Source Code ==
The source code for the unminified JavaScript and CSS can be found at:
[link](https://github.com/esaia/interactive-real-estate)

== Build Instructions ==
To rebuild the minified JavaScript files, follow these steps:

1. Clone or download the repository.
2. Run `npm install` to install dependencies.
3. Run `npm run build` to generate the minified files.
4. The minified files will be located in `dist/assets/index.js`.

== Video Tutorial ==

Using this plugin may be complicated, For a step-by-step walkthrough on how to use the plugin, watch our video tutorial here:

[Watch the Video Tutorial](https://youtu.be/dQmqouszdK0)

This video covers:
- How to create a new interactive project.
- How to add pins and polygons to your property images.
- Add floor, flats, flat types, actions and connect it to polygons.
- Customize the colors of your SVG paths.


== Changelog ==
= 1.0 =
* Initial release of the Interactive Real Estate plugin.

= 1.1 =
* fix: all issues that wp reviewer mentioned

= 1.2 =
* Update readme add Video Tutorial section

= 1.3 =
* fix: sqlite problem on db table migrations on plugin activation

= 1.4 =
* fix: databas table migrations problem

= 1.5 =
* refactor: sanitize data

= 1.6 =
* refactor: sanitize data in every controller method

