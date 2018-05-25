
const gulp = require('gulp');
const babel = require('gulp-babel');

gulp.task('es6-main', () => {
    return gulp.src('./main.js')
    .pipe(babel({
        presets:['es2015']
    }))
    .pipe(gulp.dest('build'))
});
gulp.task('es6-product', () => {
    return gulp.src('./product.js')
    .pipe(babel({
        presets:['es2015']
    }))
    .pipe(gulp.dest('build'))
});
gulp.task('default',['es6-product'], () => {
    gulp.start('es6-main');
})