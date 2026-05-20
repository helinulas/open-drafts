const yaml = require("js-yaml");
const { marked } = require("marked");

module.exports = function(eleventyConfig) {
  // Pass through static assets
  eleventyConfig.addPassthroughCopy("fonts");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("favicon.svg");
  eleventyConfig.addPassthroughCopy("admin");

  // YAML data files
  eleventyConfig.addDataExtension("yml", contents => yaml.load(contents));

  // Sessions collection — sorted by semester order then session order
  eleventyConfig.addCollection("sessions", function(collectionApi) {
    return collectionApi.getFilteredByGlob("content/sessions/*.md")
      .sort((a, b) => {
        if (a.data.semester !== b.data.semester) {
          return a.data.semester.localeCompare(b.data.semester);
        }
        return (a.data.order || 0) - (b.data.order || 0);
      });
  });

  // Filter: get sessions for a specific semester
  eleventyConfig.addFilter("bySemester", function(sessions, semesterId) {
    return sessions.filter(s => s.data.semester === semesterId)
      .sort((a, b) => (a.data.order || 0) - (b.data.order || 0));
  });

  // Filter: ensure URL has https:// prefix
  eleventyConfig.addFilter("ensureHttps", function(url) {
    if (!url) return url;
    if (!url.startsWith("http")) return "https://" + url;
    return url;
  });

  // Filter: render markdown string
  eleventyConfig.addFilter("markdownify", function(str) {
    if (!str) return "";
    return marked.parse(str);
  });

  // Filter: color class for a given 0-based index (cycles mod 7)
  eleventyConfig.addFilter("colorForIndex", function(idx) {
    const palette = [
      { bg: "#A0B0FF", text: "#111", cls: "c1" },
      { bg: "#FC6B44", text: "#fff", cls: "c2" },
      { bg: "#60BB4D", text: "#fff", cls: "c3" },
      { bg: "#CFDD47", text: "#111", cls: "c4" },
      { bg: "#F277E1", text: "#111", cls: "c5" },
      { bg: "#9FCCF4", text: "#111", cls: "c6" },
      { bg: "#BD5C2F", text: "#fff", cls: "c7" },
    ];
    return palette[idx % 7];
  });

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};
